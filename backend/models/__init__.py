"""
ProjectSense AI - Models Package
Import all models here to ensure SQLAlchemy registers them.
"""
from models.user import User, UserRole
from models.project import Project, ProjectStatus
from models.evaluation import Evaluation
from models.rubric import Rubric

__all__ = ["User", "UserRole", "Project", "ProjectStatus", "Evaluation", "Rubric"]
