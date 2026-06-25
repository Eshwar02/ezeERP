"""Utilities: invoice PDF generation (ReportLab) per PDF Section 9."""
import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ezeERP brand palette: green / white / blue
BRAND_GREEN = colors.HexColor("#21c25e")
BRAND_BLUE = colors.HexColor("#00a8ec")


def build_invoice_pdf(company, customer, sale):
    """Return a BytesIO containing the invoice PDF for a sale."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=18 * mm, bottomMargin=18 * mm)
    styles = getSampleStyleSheet()
    title = styles["Title"]
    title.textColor = BRAND_BLUE
    normal = styles["Normal"]

    elements = [
        Paragraph(company.name if company else "ezeERP", title),
        Paragraph("Tax Invoice", styles["Heading2"]),
    ]
    meta_bits = []
    if company:
        if company.address:
            meta_bits.append(company.address)
        if company.gst_number:
            meta_bits.append(f"GSTIN: {company.gst_number}")
    if meta_bits:
        elements.append(Paragraph(" &nbsp;|&nbsp; ".join(meta_bits), normal))
    elements.append(Spacer(1, 8))

    info = [
        ["Invoice #", sale.invoice_number, "Date", sale.date.strftime("%Y-%m-%d") if sale.date else ""],
        ["Bill To", customer.name if customer else "Cash", "Mobile", (customer.mobile if customer else "") or ""],
    ]
    info_tbl = Table(info, colWidths=[28 * mm, 70 * mm, 24 * mm, 50 * mm])
    info_tbl.setStyle(
        TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TEXTCOLOR", (0, 0), (0, -1), BRAND_GREEN),
            ("TEXTCOLOR", (2, 0), (2, -1), BRAND_GREEN),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ])
    )
    elements.extend([info_tbl, Spacer(1, 10)])

    head = ["#", "Item", "Qty", "Rate", "GST%", "Amount"]
    rows = [head]
    for i, it in enumerate(sale.items, 1):
        rows.append([
            str(i), it.name, f"{it.quantity:g}", f"{it.rate:.2f}",
            f"{it.gst_percentage:g}", f"{it.amount:.2f}",
        ])
    rows.append(["", "", "", "", "Subtotal", f"{sale.subtotal:.2f}"])
    rows.append(["", "", "", "", "Tax", f"{sale.tax_total:.2f}"])
    rows.append(["", "", "", "", "Total", f"{sale.total:.2f}"])

    tbl = Table(rows, colWidths=[10 * mm, 70 * mm, 18 * mm, 24 * mm, 18 * mm, 28 * mm])
    tbl.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
            ("GRID", (0, 0), (-1, -4), 0.4, colors.HexColor("#d0d0d0")),
            ("LINEABOVE", (4, -3), (-1, -3), 0.5, BRAND_GREEN),
            ("FONTNAME", (4, -1), (-1, -1), "Helvetica-Bold"),
            ("TEXTCOLOR", (4, -1), (-1, -1), BRAND_GREEN),
            ("ROWBACKGROUNDS", (0, 1), (-1, -4), [colors.white, colors.HexColor("#f3fbf6")]),
        ])
    )
    elements.append(tbl)
    elements.append(Spacer(1, 16))
    elements.append(Paragraph("Thank you for your business — powered by ezeERP", normal))

    doc.build(elements)
    buf.seek(0)
    return buf
