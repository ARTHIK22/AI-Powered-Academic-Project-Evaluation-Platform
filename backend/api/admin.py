"""
ProjectSense AI - Admin API
GET /api/admin/users            — List all users
PUT /api/admin/users/{id}       — Toggle user active/role
GET /api/admin/analytics        — Dashboard analytics
GET /api/admin/evaluations      — All evaluations
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct
from pydantic import BaseModel
from typing import Optional

from core.database import get_db
from core.security import get_current_user
from models.user import User, UserRole
from models.project import Project, ProjectStatus
from models.evaluation import Evaluation

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


class UpdateUserPayload(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_admin),
):
    """List all registered users."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "department": u.department,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    payload: UpdateUserPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_admin),
):
    """Admin: toggle user status or change role."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role is not None:
        user.role = payload.role
    if payload.department is not None:
        user.department = payload.department

    await db.commit()
    return {"message": "User updated"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted"}


@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(_require_admin),
):
    """Dashboard analytics: counts, score distributions, activity."""
    # User counts by role
    user_counts = {}
    for role in UserRole:
        result = await db.execute(select(func.count()).where(User.role == role))
        user_counts[role] = result.scalar()

    # Project counts by status
    project_counts = {}
    for status in ProjectStatus:
        result = await db.execute(select(func.count()).where(Project.status == status))
        project_counts[status] = result.scalar()

    # Average scores
    avg_result = await db.execute(
        select(
            func.avg(Evaluation.report_score),
            func.avg(Evaluation.code_score),
            func.avg(Evaluation.innovation_score),
            func.avg(Evaluation.converted_percentage),
        )
    )
    avgs = avg_result.first()

    # Recent submissions (last 10)
    recent_result = await db.execute(
        select(Project).order_by(Project.submitted_at.desc()).limit(10)
    )
    recent_projects = recent_result.scalars().all()

    # Difficulty distribution
    diff_result = await db.execute(
        select(Evaluation.difficulty_level, func.count()).group_by(Evaluation.difficulty_level)
    )
    difficulty_dist = {row[0]: row[1] for row in diff_result.all() if row[0]}

    return {
        "users": {
            "total": sum(user_counts.values()),
            "students": user_counts.get(UserRole.student, 0),
            "teachers": user_counts.get(UserRole.teacher, 0),
            "admins": user_counts.get(UserRole.admin, 0),
        },
        "projects": {
            "total": sum(project_counts.values()),
            "pending": project_counts.get(ProjectStatus.pending, 0),
            "processing": project_counts.get(ProjectStatus.processing, 0),
            "evaluated": project_counts.get(ProjectStatus.evaluated, 0),
            "reviewed": project_counts.get(ProjectStatus.reviewed, 0),
        },
        "average_scores": {
            "report": round(avgs[0] or 0, 1),
            "code": round(avgs[1] or 0, 1),
            "innovation": round(avgs[2] or 0, 1),
            "overall": round(avgs[3] or 0, 1),
        },
        "difficulty_distribution": difficulty_dist,
        "recent_projects": [
            {
                "id": p.id,
                "title": p.title,
                "status": p.status,
                "submitted_at": p.submitted_at.isoformat(),
            }
            for p in recent_projects
        ],
    }
