"""
ProjectSense AI - PDF Report Exporter
Generates professional evaluation PDF reports using ReportLab.
"""
import io
import logging
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

logger = logging.getLogger(__name__)

# ── Color Palette ─────────────────────────────────────────────────────────────
PRIMARY = colors.HexColor("#6366f1")    # Indigo
SECONDARY = colors.HexColor("#8b5cf6")  # Violet
SUCCESS = colors.HexColor("#10b981")    # Emerald
WARNING = colors.HexColor("#f59e0b")    # Amber
DANGER = colors.HexColor("#ef4444")     # Red
LIGHT_BG = colors.HexColor("#f8fafc")
DARK_TEXT = colors.HexColor("#1e293b")
MUTED = colors.HexColor("#64748b")


def score_color(score: float) -> colors.HexColor:
    if score >= 80:
        return SUCCESS
    elif score >= 60:
        return WARNING
    return DANGER


def generate_evaluation_pdf(
    project_title: str,
    student_name: str,
    evaluation: dict,
    rubric_marks: dict | None = None,
) -> bytes:
    """
    Generate a professional PDF evaluation report.
    Returns raw bytes of the PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Title Section ─────────────────────────────────────────────────────────
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=24,
        textColor=PRIMARY,
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=12,
        textColor=MUTED,
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=PRIMARY,
        spaceBefore=16,
        spaceAfter=8,
        fontName="Helvetica-Bold",
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        textColor=DARK_TEXT,
        spaceAfter=6,
        leading=16,
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=body_style,
        leftIndent=20,
        bulletIndent=10,
    )

    story.append(Paragraph("ProjectSense AI", subtitle_style))
    story.append(Paragraph("Academic Project Evaluation Report", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY))
    story.append(Spacer(1, 0.5 * cm))

    # ── Project Info ───────────────────────────────────────────────────────────
    info_data = [
        ["Project Title:", project_title],
        ["Student Name:", student_name],
        ["Evaluation Date:", datetime.now().strftime("%B %d, %Y")],
        ["Difficulty Level:", evaluation.get("difficulty_level", "N/A")],
        ["Innovation Score:", f"{evaluation.get('innovation_score', 0)}/100"],
    ]
    info_table = Table(info_data, colWidths=[4 * cm, 13 * cm])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), MUTED),
        ("TEXTCOLOR", (1, 0), (1, -1), DARK_TEXT),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.5 * cm))

    # ── Score Summary ──────────────────────────────────────────────────────────
    story.append(Paragraph("📊 Score Summary", heading_style))
    scores = [
        ("Report Quality", evaluation.get("report_score", 0)),
        ("Code Quality", evaluation.get("code_score", 0)),
        ("Documentation", evaluation.get("documentation_score", 0)),
        ("Innovation", evaluation.get("innovation_score", 0)),
        ("Presentation", evaluation.get("presentation_score", 0)),
    ]
    score_data = [["Category", "Score", "Bar"]]
    for name, score in scores:
        bar_filled = "█" * int(score / 10)
        bar_empty = "░" * (10 - int(score / 10))
        score_data.append([name, f"{score}/100", bar_filled + bar_empty])

    score_table = Table(score_data, colWidths=[5 * cm, 3 * cm, 9 * cm])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_BG, colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(score_table)

    # ── Predicted Marks ────────────────────────────────────────────────────────
    if rubric_marks and rubric_marks.get("marks"):
        story.append(Paragraph("🎯 Predicted Marks (Rubric-Based)", heading_style))
        marks_data = [["Criterion", "Predicted", "Max", "Justification"]]
        for criterion, data in rubric_marks["marks"].items():
            marks_data.append([
                criterion,
                str(data.get("score", "")),
                str(data.get("max", "")),
                data.get("justification", "")[:60] + "..." if len(data.get("justification", "")) > 60 else data.get("justification", ""),
            ])
        marks_data.append([
            "TOTAL",
            str(rubric_marks.get("total", "")),
            str(rubric_marks.get("total_max", "")),
            f"{rubric_marks.get('percentage', '')}%",
        ])

        marks_table = Table(marks_data, colWidths=[4 * cm, 2.5 * cm, 2 * cm, 8.5 * cm])
        marks_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), SECONDARY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#ede9fe")),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [LIGHT_BG, colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(marks_table)

    # ── Overall Feedback ───────────────────────────────────────────────────────
    story.append(Paragraph("💬 Overall Feedback", heading_style))
    story.append(Paragraph(evaluation.get("overall_feedback", "N/A"), body_style))

    # ── Strengths ──────────────────────────────────────────────────────────────
    strengths = evaluation.get("strengths", [])
    if strengths:
        story.append(Paragraph("✅ Strengths", heading_style))
        for s in strengths:
            story.append(Paragraph(f"• {s}", bullet_style))

    # ── Weaknesses ────────────────────────────────────────────────────────────
    weaknesses = evaluation.get("weaknesses", [])
    if weaknesses:
        story.append(Paragraph("⚠️ Areas for Improvement", heading_style))
        for w in weaknesses:
            story.append(Paragraph(f"• {w}", bullet_style))

    # ── Improvement Suggestions ───────────────────────────────────────────────
    suggestions = evaluation.get("improvement_suggestions", [])
    if suggestions:
        story.append(PageBreak())
        story.append(Paragraph("🚀 Improvement Suggestions", heading_style))
        for i, s in enumerate(suggestions, 1):
            story.append(Paragraph(f"{i}. {s}", bullet_style))

    # ── Viva Questions ────────────────────────────────────────────────────────
    viva = evaluation.get("viva_questions", {})
    if viva:
        story.append(Paragraph("🎤 Viva Questions", heading_style))
        for level, qs in [("Basic", viva.get("basic", [])), ("Intermediate", viva.get("intermediate", [])), ("Advanced", viva.get("advanced", []))]:
            if qs:
                story.append(Paragraph(f"{level} Level:", ParagraphStyle("SubHead", parent=body_style, fontName="Helvetica-Bold", textColor=MUTED)))
                for q_item in qs:
                    q = q_item.get("question", q_item) if isinstance(q_item, dict) else q_item
                    story.append(Paragraph(f"• {q}", bullet_style))

    # ── Footer ─────────────────────────────────────────────────────────────────
    story.append(Spacer(1, cm))
    story.append(HRFlowable(width="100%", thickness=1, color=MUTED))
    story.append(Paragraph(
        "Generated by ProjectSense AI — AI-Powered Academic Project Evaluation Platform",
        ParagraphStyle("Footer", parent=body_style, textColor=MUTED, alignment=TA_CENTER, fontSize=8),
    ))

    doc.build(story)
    return buffer.getvalue()
