"""
ProjectSense AI - Evaluation Model
Stores the full AI evaluation result for a project.
"""
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), unique=True)

    # ── AI Score Breakdown ──────────────────────────────────────────
    report_score: Mapped[float | None] = mapped_column(Float, nullable=True)        # /100
    code_score: Mapped[float | None] = mapped_column(Float, nullable=True)          # /100
    documentation_score: Mapped[float | None] = mapped_column(Float, nullable=True) # /100
    innovation_score: Mapped[float | None] = mapped_column(Float, nullable=True)    # /100
    presentation_score: Mapped[float | None] = mapped_column(Float, nullable=True)  # /100

    # ── Predicted Marks (rubric-based) ─────────────────────────────
    predicted_marks: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Example: {"documentation": {"score": 18, "max": 20}, "implementation": {...}, ...}
    total_predicted: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    converted_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)

    # ── Difficulty & Innovation ─────────────────────────────────────
    difficulty_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Beginner | Intermediate | Advanced | Industry Level
    is_clone: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    similarity_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)

    # ── Textual AI Feedback ─────────────────────────────────────────
    overall_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    missing_sections: Mapped[list | None] = mapped_column(JSON, nullable=True)
    improvement_suggestions: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # ── Viva Questions ──────────────────────────────────────────────
    viva_questions: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Example: {"basic": [...], "intermediate": [...], "advanced": [...]}

    # ── Code Analysis ───────────────────────────────────────────────
    code_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # bugs, security_issues, naming_issues, complexity, folder_structure

    # ── Teacher Review ──────────────────────────────────────────────
    teacher_adjusted_marks: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    teacher_comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    teacher_final_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    reviewed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="evaluation")  # type: ignore[name-defined]
    reviewed_by: Mapped["User | None"] = relationship("User", foreign_keys=[reviewed_by_id])  # type: ignore[name-defined]
