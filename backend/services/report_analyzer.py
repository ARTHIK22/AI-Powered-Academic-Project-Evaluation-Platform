"""
ProjectSense AI - Report Analyzer
Parses PDF and DOCX files to extract text content.
"""
import io
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

REQUIRED_SECTIONS = [
    "abstract",
    "introduction",
    "literature review",
    "objectives",
    "methodology",
    "results",
    "conclusion",
    "references",
]


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF using PyMuPDF."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except ImportError:
        logger.warning("PyMuPDF not available, falling back to basic extraction")
        return ""
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file using python-docx."""
    try:
        from docx import Document
        doc = Document(file_path)
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(paragraphs)
    except ImportError:
        logger.warning("python-docx not available")
        return ""
    except Exception as e:
        logger.error(f"DOCX extraction failed: {e}")
        return ""


def extract_report_text(file_path: str) -> str:
    """Extract text from PDF or DOCX based on file extension."""
    path = Path(file_path)
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(file_path)
    elif suffix in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    else:
        logger.warning(f"Unsupported report format: {suffix}")
        return ""


def find_missing_sections(text: str) -> tuple[list[str], list[str]]:
    """Find present and missing sections in the report."""
    text_lower = text.lower()
    found = [s for s in REQUIRED_SECTIONS if s in text_lower]
    missing = [s for s in REQUIRED_SECTIONS if s not in text_lower]
    return [s.title() for s in found], [s.title() for s in missing]


def count_word_statistics(text: str) -> dict:
    """Compute basic word/page statistics."""
    words = text.split()
    sentences = text.count(".") + text.count("!") + text.count("?")
    paragraphs = text.count("\n\n") + 1
    return {
        "word_count": len(words),
        "sentence_count": sentences,
        "paragraph_count": paragraphs,
        "estimated_pages": max(1, len(words) // 250),
    }
