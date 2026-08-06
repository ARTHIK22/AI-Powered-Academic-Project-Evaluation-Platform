"""
ProjectSense AI - Student API
POST /api/student/submit       — Upload project files
GET  /api/student/projects     — List student's projects
GET  /api/student/results/{id} — Get evaluation results
GET  /api/student/export/{id}  — Download PDF report
"""
import os
import uuid
import shutil
import asyncio
import logging
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import Optional
import io

from core.database import get_db
from core.security import get_current_user
from core.config import settings
from models.user import User, UserRole
from models.project import Project, ProjectStatus
from models.evaluation import Evaluation
from models.rubric import Rubric
import services.ai_evaluator as ai
from services.report_analyzer import extract_report_text, find_missing_sections
from services.code_analyzer import build_code_summary
from services.pdf_exporter import generate_evaluation_pdf

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/student", tags=["Student"])


def _require_student(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.student, UserRole.admin):
        raise HTTPException(status_code=403, detail="Student access required")
    return current_user


async def _run_evaluation_pipeline(project_id: int, db_session_factory):
    """Background task: run the full AI evaluation pipeline for a project."""
    from core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Project).where(Project.id == project_id))
            project = result.scalar_one_or_none()
            if not project:
                return

            # Mark as processing
            await db.execute(update(Project).where(Project.id == project_id).values(status=ProjectStatus.processing))
            await db.commit()

            # ── Step 1: Analyze report ─────────────────────────────────────────
            report_text = ""
            if project.report_path and os.path.exists(project.report_path):
                report_text = extract_report_text(project.report_path)
            sections_found, sections_missing = find_missing_sections(report_text)

            report_eval = await ai.evaluate_report(report_text or f"Project: {project.title}", project.title)

            # ── Step 2: Analyze code ───────────────────────────────────────────
            code_summary_data = {}
            code_text = f"Project: {project.title}. {project.description or ''}"
            if project.code_path and os.path.exists(project.code_path):
                extract_dir = project.code_path.replace(".zip", "_extracted")
                os.makedirs(extract_dir, exist_ok=True)
                code_summary_data = build_code_summary(project.code_path, extract_dir)
                code_text = code_summary_data.get("code_snippets", code_text)

            code_eval = await ai.evaluate_code(code_text, project.title)

            # ── Step 3: Innovation + difficulty ───────────────────────────────
            innovation_eval = await ai.analyze_innovation(
                project.title,
                project.description or "",
                report_text[:3000],
            )

            # ── Step 4: Viva questions ─────────────────────────────────────────
            tech_stack = ", ".join(code_summary_data.get("file_types", {}).keys()) or "General"
            viva_qs = await ai.generate_viva_questions(project.title, project.description or "", tech_stack)

            # ── Step 5: Get default rubric and predict marks ──────────────────
            rubric_result = await db.execute(select(Rubric).where(Rubric.is_default == True).limit(1))
            rubric = rubric_result.scalar_one_or_none()
            default_criteria = [
                {"name": "Documentation", "max_marks": 20},
                {"name": "Implementation", "max_marks": 30},
                {"name": "Innovation", "max_marks": 20},
                {"name": "Presentation", "max_marks": 15},
                {"name": "Code Quality", "max_marks": 15},
            ]
            criteria = rubric.criteria if rubric else default_criteria

            marks_data = await ai.predict_marks(
                rubric_criteria=criteria,
                report_score=report_eval.get("score", 70),
                code_score=code_eval.get("score", 70),
                documentation_score=report_eval.get("formatting_score", 70),
                innovation_score=innovation_eval.get("innovation_score", 70),
                presentation_score=75,
                overall_feedback=report_eval.get("overall_feedback", ""),
            )

            # ── Step 6: Improvement suggestions ──────────────────────────────
            suggestions = await ai.generate_improvement_suggestions(
                strengths=report_eval.get("strengths", []),
                weaknesses=report_eval.get("weaknesses", []),
                missing_sections=sections_missing,
                code_issues=code_eval.get("bugs", []) + code_eval.get("improvements", []),
            )

            # ── Save evaluation ───────────────────────────────────────────────
            evaluation = Evaluation(
                project_id=project_id,
                report_score=report_eval.get("score"),
                code_score=code_eval.get("score"),
                documentation_score=report_eval.get("formatting_score"),
                innovation_score=innovation_eval.get("innovation_score"),
                presentation_score=75,
                predicted_marks=marks_data.get("marks"),
                total_predicted=marks_data.get("total"),
                total_max=marks_data.get("total_max"),
                converted_percentage=marks_data.get("percentage"),
                difficulty_level=innovation_eval.get("difficulty_level"),
                is_clone=innovation_eval.get("is_clone"),
                similarity_percentage=None,
                overall_feedback=report_eval.get("overall_feedback"),
                strengths=report_eval.get("strengths"),
                weaknesses=report_eval.get("weaknesses"),
                missing_sections=sections_missing,
                improvement_suggestions=suggestions,
                viva_questions=viva_qs,
                code_analysis={
                    "complexity": code_eval.get("complexity"),
                    "naming_conventions": code_eval.get("naming_conventions"),
                    "documentation_coverage": code_eval.get("documentation_coverage"),
                    "bugs": code_eval.get("bugs"),
                    "security_issues": code_eval.get("security_issues"),
                    "folder_structure": code_eval.get("folder_structure"),
                    "total_files": code_summary_data.get("total_files"),
                    "total_lines": code_summary_data.get("total_lines"),
                    "has_tests": code_summary_data.get("has_tests"),
                    "pylint_score": code_summary_data.get("pylint_score"),
                },
            )
            db.add(evaluation)

            # Update project status
            await db.execute(update(Project).where(Project.id == project_id).values(status=ProjectStatus.evaluated))
            await db.commit()
            logger.info(f"Evaluation complete for project {project_id}")

        except Exception as e:
            logger.error(f"Evaluation pipeline failed for project {project_id}: {e}")
            await db.execute(update(Project).where(Project.id == project_id).values(status=ProjectStatus.pending))
            await db.commit()


@router.post("/submit")
async def submit_project(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    report: Optional[UploadFile] = File(None),
    code_zip: Optional[UploadFile] = File(None),
    ppt: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_student),
):
    """Submit a new project for AI evaluation."""
    upload_dir = Path(settings.UPLOAD_DIR)
    project_folder = upload_dir / str(current_user.id) / str(uuid.uuid4())
    project_folder.mkdir(parents=True, exist_ok=True)

    report_path = code_path = ppt_path = None

    # Save uploaded files
    async def save_file(upload: UploadFile, subfolder: str) -> str:
        dest_dir = project_folder / subfolder
        dest_dir.mkdir(exist_ok=True)
        dest = dest_dir / upload.filename
        content = await upload.read()
        with open(dest, "wb") as f:
            f.write(content)
        return str(dest)

    if report:
        report_path = await save_file(report, "report")
    if code_zip:
        code_path = await save_file(code_zip, "code")
    if ppt:
        ppt_path = await save_file(ppt, "ppt")

    # Create project record
    project = Project(
        title=title,
        description=description,
        student_id=current_user.id,
        github_url=github_url,
        report_path=report_path,
        code_path=code_path,
        ppt_path=ppt_path,
        status=ProjectStatus.pending,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)

    # Kick off evaluation in background
    background_tasks.add_task(_run_evaluation_pipeline, project.id, None)

    return {
        "project_id": project.id,
        "status": project.status,
        "message": "Project submitted. AI evaluation is running in the background.",
    }


@router.get("/projects")
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_student),
):
    """List all projects submitted by the current student."""
    result = await db.execute(
        select(Project)
        .where(Project.student_id == current_user.id)
        .order_by(Project.submitted_at.desc())
    )
    projects = result.scalars().all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "status": p.status,
            "submitted_at": p.submitted_at.isoformat(),
            "has_report": bool(p.report_path),
            "has_code": bool(p.code_path),
            "has_ppt": bool(p.ppt_path),
        }
        for p in projects
    ]


@router.get("/results/{project_id}")
async def get_results(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_student),
):
    """Get full AI evaluation results for a project."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.evaluation))
        .where(Project.id == project_id, Project.student_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not project.evaluation:
        return {
            "project_id": project_id,
            "status": project.status,
            "message": "Evaluation not ready yet. Please wait.",
        }

    ev = project.evaluation
    return {
        "project_id": project_id,
        "title": project.title,
        "status": project.status,
        "scores": {
            "report": ev.report_score,
            "code": ev.code_score,
            "documentation": ev.documentation_score,
            "innovation": ev.innovation_score,
            "presentation": ev.presentation_score,
        },
        "predicted_marks": ev.predicted_marks,
        "total_predicted": ev.total_predicted,
        "total_max": ev.total_max,
        "converted_percentage": ev.converted_percentage,
        "difficulty_level": ev.difficulty_level,
        "is_clone": ev.is_clone,
        "overall_feedback": ev.overall_feedback,
        "strengths": ev.strengths,
        "weaknesses": ev.weaknesses,
        "missing_sections": ev.missing_sections,
        "improvement_suggestions": ev.improvement_suggestions,
        "viva_questions": ev.viva_questions,
        "code_analysis": ev.code_analysis,
        "teacher_comments": ev.teacher_comments,
        "teacher_final_score": ev.teacher_final_score,
    }


@router.get("/export/{project_id}")
async def export_pdf(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_student),
):
    """Download evaluation report as PDF."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.evaluation))
        .where(Project.id == project_id, Project.student_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if not project or not project.evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    ev = project.evaluation
    eval_dict = {
        "report_score": ev.report_score or 0,
        "code_score": ev.code_score or 0,
        "documentation_score": ev.documentation_score or 0,
        "innovation_score": ev.innovation_score or 0,
        "presentation_score": ev.presentation_score or 0,
        "difficulty_level": ev.difficulty_level,
        "overall_feedback": ev.overall_feedback,
        "strengths": ev.strengths or [],
        "weaknesses": ev.weaknesses or [],
        "improvement_suggestions": ev.improvement_suggestions or [],
        "viva_questions": ev.viva_questions or {},
    }
    rubric_marks = {
        "marks": ev.predicted_marks or {},
        "total": ev.total_predicted,
        "total_max": ev.total_max,
        "percentage": ev.converted_percentage,
    }

    pdf_bytes = generate_evaluation_pdf(
        project_title=project.title,
        student_name=current_user.full_name,
        evaluation=eval_dict,
        rubric_marks=rubric_marks,
    )

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="evaluation_{project_id}.pdf"'},
    )
