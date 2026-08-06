"""
ProjectSense AI - Viva Question Generator
Standalone service (thin wrapper over ai_evaluator.generate_viva_questions).
"""
from services.ai_evaluator import generate_viva_questions

__all__ = ["generate_viva_questions"]
