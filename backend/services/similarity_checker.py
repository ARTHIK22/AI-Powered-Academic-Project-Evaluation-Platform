"""
ProjectSense AI - Similarity Checker
Uses Sentence Transformers for semantic similarity between projects.
Falls back gracefully if model not downloaded.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_model = None


def _get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Sentence Transformer model loaded")
        except Exception as e:
            logger.warning(f"Could not load Sentence Transformer: {e}")
    return _model


def compute_similarity(text_a: str, text_b: str) -> float:
    """
    Compute cosine similarity between two texts.
    Returns a float between 0.0 and 1.0.
    """
    model = _get_model()
    if model is None:
        return 0.0
    try:
        import numpy as np
        emb_a = model.encode(text_a, convert_to_numpy=True)
        emb_b = model.encode(text_b, convert_to_numpy=True)
        dot = float(np.dot(emb_a, emb_b))
        norm = float(np.linalg.norm(emb_a) * np.linalg.norm(emb_b))
        return round(dot / norm if norm > 0 else 0.0, 4)
    except Exception as e:
        logger.error(f"Similarity computation failed: {e}")
        return 0.0


def similarity_percentage(text_a: str, text_b: str) -> float:
    """Returns similarity as a percentage (0–100)."""
    return round(compute_similarity(text_a, text_b) * 100, 1)
