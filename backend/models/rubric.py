"""
ProjectSense AI - Rubric Model
Teacher-defined evaluation rubric with weighted criteria.
"""
from datetime import datetime, timezone
from sqlalchemy import String, Integer, ForeignKey, DateTime, JSON, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class Rubric(Base):
    __tablename__ = "rubrics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    # Criteria as JSON array:
    # [{"name": "Documentation", "max_marks": 20, "weight": 1.0, "description": "..."},  ...]
    criteria: Mapped[list] = mapped_column(JSON, default=list)

    total_marks: Mapped[int] = mapped_column(Integer, default=100)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    teacher: Mapped["User"] = relationship("User", back_populates="rubrics")  # type: ignore[name-defined]
