"""
ProjectSense AI - Project Model
Tracks student project submissions with file paths.
"""
from datetime import datetime, timezone
from sqlalchemy import String, Integer, ForeignKey, DateTime, Enum as SAEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
import enum


class ProjectStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    evaluated = "evaluated"
    reviewed = "reviewed"  # Teacher has reviewed


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    github_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # File paths (relative to UPLOAD_DIR)
    report_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    code_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    ppt_path: Mapped[str | None] = mapped_column(String(512), nullable=True)

    status: Mapped[ProjectStatus] = mapped_column(
        SAEnum(ProjectStatus), default=ProjectStatus.pending
    )
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    student: Mapped["User"] = relationship("User", back_populates="projects", foreign_keys=[student_id])  # type: ignore[name-defined]
    evaluation: Mapped["Evaluation | None"] = relationship("Evaluation", back_populates="project", uselist=False)  # type: ignore[name-defined]
