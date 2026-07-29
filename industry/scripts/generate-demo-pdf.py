from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


OUTPUT = Path(__file__).resolve().parents[1] / "public" / "downloads" / "mx-c120-demo-spec.pdf"
PAGE_WIDTH, PAGE_HEIGHT = A4
ORANGE = colors.HexColor("#F15A29")
GRAPHITE = colors.HexColor("#171916")
PAPER = colors.HexColor("#F3EFE6")


def draw_specification() -> None:
    document = canvas.Canvas(str(OUTPUT), pagesize=A4)
    document.setTitle("MATRILINK MX-C120 Demo Specification")
    document.setAuthor("MATRILINK Frontend Candidate Demo")
    document.setFillColor(PAPER)
    document.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)

    document.setFillColor(GRAPHITE)
    document.setFont("Helvetica-Bold", 10)
    document.drawString(44, PAGE_HEIGHT - 46, "MATRILINK / INDUSTRIAL CONNECTION SYSTEMS")
    document.setFillColor(ORANGE)
    document.rect(PAGE_WIDTH - 60, PAGE_HEIGHT - 51, 16, 16, fill=1, stroke=0)

    document.setFillColor(GRAPHITE)
    document.setFont("Helvetica-Bold", 42)
    document.drawString(44, PAGE_HEIGHT - 132, "MX-C120")
    document.setFont("Helvetica", 15)
    document.drawString(46, PAGE_HEIGHT - 158, "Modular industrial connector")
    document.setStrokeColor(GRAPHITE)
    document.line(44, PAGE_HEIGHT - 178, PAGE_WIDTH - 44, PAGE_HEIGHT - 178)

    rows = [
        ("Rated current", "120 A"),
        ("Rated voltage", "1000 V"),
        ("Protection", "IP67"),
        ("Connection pitch", "5.08 mm"),
        ("Wire range", "0.5 - 35 mm2"),
        ("Mechanical life", "500 cycles"),
    ]
    top = PAGE_HEIGHT - 226
    document.setFont("Helvetica-Bold", 9)
    document.drawString(44, top + 30, "SPECIFICATION / 01")
    for index, (label, value) in enumerate(rows):
        y = top - index * 42
        document.setStrokeColor(colors.HexColor("#BEB7AA"))
        document.line(44, y - 12, PAGE_WIDTH - 44, y - 12)
        document.setFillColor(colors.HexColor("#5F625C"))
        document.setFont("Helvetica", 9)
        document.drawString(44, y + 4, label.upper())
        document.setFillColor(GRAPHITE)
        document.setFont("Helvetica-Bold", 11)
        document.drawRightString(PAGE_WIDTH - 44, y + 4, value)

    document.saveState()
    document.setFillAlpha(0.08)
    document.setFillColor(ORANGE)
    document.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2)
    document.rotate(32)
    document.setFont("Helvetica-Bold", 66)
    document.drawCentredString(0, 0, "DEMO ONLY")
    document.restoreState()

    document.setFillColor(GRAPHITE)
    document.setFont("Helvetica-Bold", 9)
    document.drawString(44, 58, "FRONTEND CANDIDATE DEMO")
    document.setFont("Helvetica", 8)
    document.drawRightString(
        PAGE_WIDTH - 44,
        58,
        "Fictional data. Not certified. Not for production use.",
    )
    document.save()


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    draw_specification()
