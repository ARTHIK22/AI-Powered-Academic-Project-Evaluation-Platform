"""
ProjectSense AI - Teacher API
GET    /api/teacher/projects              — List all student projects
GET    /api/teacher/projects/{id}         — Get project details + evaluation
PUT    /api/teacher/review/{id}           — Adjust marks + add comment
GET    /api/teacher/rubrics               — List rubrics
POST   /api/teacher/rubrics               — Create rubric
PUT    /api/teacher/rubrics/{id}          — Update rubric
DELETE /api/teacher/rubrics/{id}          — Delete rubric
GET    /api/teacher/export/{project_id}   — Export PDF for any student
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional
import io

from fastapi.responses import StreamingResponse
from core.database import get_db
from core.security import get_current_user
from models.user import User, UserRole
from models.project import Project, ProjectStatus
from models.evaluation import Evaluation
from models.rubric import Rubric
from services.pdf_exporter import generate_evaluation_pdf

router = APIRouter(prefix="/api/teacher", tags=["Teacher"])


def _require_teacher(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.teacher, UserRole.admin):
        raise HTTPException(status_code=403, detail="Teacher access required")
    return current_user


# ── Schemas ────────────────────────────────────────────────────────────────────

class ReviewPayload(BaseModel):
    adjusted_marks: Optional[dict] = None
    teacher_comments: Optional[str] = None
    final_score: Optional[float] = None


class RubricPayload(BaseModel):
    name: str
    description: Optional[str] = None
    is_default: bool = False
    criteria: list[dict]  # [{name, max_marks, description}]
    total_marks: int = 100


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/projects")
async def list_all_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_teacher),
):
    """List all student project submissions with basic evaluation info."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.student), selectinload(Project.evaluation))
        .order_by(Project.submitted_at.desc())
    )
    projects = result.scalars().all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "student": {"id": p.student.id, "name": p.student.full_name, "email": p.student.email},
            "status": p.status,
            "submitted_at": p.submitted_at.isoformat(),
            "overall_score": p.evaluation.converted_percentage if p.evaluation else None,
            "difficulty_level": p.evaluation.difficulty_level if p.evaluation else None,
            "teacher_reviewed": p.status == ProjectStatus.reviewed,
        }
        for p in projects
    ]


@router.get("/projects/{project_id}")
async def get_project_detail(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_teacher),
):
    """Get full project details including evaluation for teacher review."""
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.student),
            selectinload(Project.evaluation),
        )
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    ev = project.evaluation
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "github_url": project.github_url,
        "status": project.status,
        "submitted_at": project.submitted_at.isoformat(),
        "student": {
            "id": project.student.id,
            "name": project.student.full_name,
            "email": project.student.email,
            "department": project.student.department,
        },
        "has_report": bool(project.report_path),
        "has_code": bool(project.code_path),
        "has_ppt": bool(project.ppt_path),
        "evaluation": {
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
            "teacher_adjusted_marks": ev.teacher_adjusted_marks,
            "teacher_comments": ev.teacher_comments,
            "teacher_final_score": ev.teacher_final_score,
        } if ev else None,
    }


@router.put("/review/{project_id}")
async def review_project(
    project_id: int,
    payload: ReviewPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_teacher),
):
    """Adjust AI marks, add comments, and finalize the evaluation."""
    result = await db.execute(
        select(Project).options(selectinload(Project.evaluation)).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project or not project.evaluation:
        raise HTTPException(status_code=404, detail="Project or evaluation not found")

    ev = project.evaluation
    if payload.adjusted_marks:
        ev.teacher_adjusted_marks = payload.adjusted_marks
    if payload.teacher_comments is not None:
        ev.teacher_comments = payload.teacher_comments
    if payload.final_score is not None:
        ev.teacher_final_score = payload.final_score
    ev.reviewed_by_id = current_user.id
    ev.reviewed_at = datetime.now(timezone.utc)

    project.status = ProjectStatus.reviewed
    await db.commit()

    return {"message": "Review saved successfully", "project_id": project_id}


# ── Rubric Routes ──────────────────────────────────────────────────────────────

@router.get("/rubrics")
async def list_rubrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_teacher),
):
    """List all rubrics created by this teacher."""
    result = await db.execute(
        select(Rubric).where(Rubric.teacher_id == current_user.id).order_by(Rubric.created_at.desc())
    )
    rubrics = result.scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "is_default": r.is_default,
            "total_marks": r.total_marks,
            "criteria": r.criteria,
            "created_at": r.created_at.isoformat(),
        }
        for r in rubrics
    ]


@router.post("/rubrics", status_code=201)
async def create_rubric(
    payload: RubricPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_teacher),
):
    """Create a new evaluation rubric."""
    if payload.is_default:
        # Clear other defaults for this teacher
        result = await db.execute(select(Rubric).where(Rubric.teacher_id == current_user.id, Rubric.is_default == True))
        for r in result.scalars().all():
            r.is_default = False

    rubric = Rubric(
        name=payload.name,
        description=payload.description,
        teacher_id=current_user.id,
        is_default=payload.is_default,
        criteria=payload.criteria,
        total_marks=payload.total_marks,
    )
    db.add(rubric)
    await db.commit()
    await db.refresh(rubric)
    return {"id": rubric.id, "message": "Rubric created"}


@router.put("/rubrics/{rubric_id}")
async def update_rubric(
    rubric_id: int,
    payload: RubricPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_teacher),
):
    """Update an existing rubric."""
    result = await db.execute(
        select(Rubric).where(Rubric.id == rubric_id, Rubric.teacher_id == current_user.id)
    )
    rubric = result.scalar_one_or_none()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")

    rubric.name = payload.name
    rubric.description = payload.description
    rubric.is_default = payload.is_default
    rubric.criteria = payload.criteria
    rubric.total_marks = payload.total_marks
    await db.commit()
    return {"message": "Rubric updated"}


@router.delete("/rubrics/{rubric_id}")
async def delete_rubric(
    rubric_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_teacher),
):
    result = await db.execute(
        select(Rubric).where(Rubric.id == rubric_id, Rubric.teacher_id == current_user.id)
    )
    rubric = result.scalar_one_or_none()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    await db.delete(rubric)
    await db.commit()
    return {"message": "Rubric deleted"}


@router.get("/export/{project_id}")
async def export_pdf(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_teacher),
):
    """Export full evaluation PDF for any student project."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.student), selectinload(Project.evaluation))
        .where(Project.id == project_id)
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
        "overall_feedback": ev.teacher_comments or ev.overall_feedback,
        "strengths": ev.strengths or [],
        "weaknesses": ev.weaknesses or [],
        "improvement_suggestions": ev.improvement_suggestions or [],
        "viva_questions": ev.viva_questions or {},
    }
    rubric_marks = {
        "marks": ev.teacher_adjusted_marks or ev.predicted_marks or {},
        "total": ev.teacher_final_score or ev.total_predicted,
        "total_max": ev.total_max,
        "percentage": ev.converted_percentage,
    }

    pdf_bytes = generate_evaluation_pdf(
        project_title=project.title,
        student_name=project.student.full_name,
        evaluation=eval_dict,
        rubric_marks=rubric_marks,
    )

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="evaluation_{project_id}.pdf"'},
    )
