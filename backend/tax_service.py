import re
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO
from datetime import datetime


def _escape_xml(text: str) -> str:
    """Escape characters that ReportLab interprets as XML markup in Paragraph."""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


# Basic Tax Service for Greek AADE Compliance (Mock)
class TaxService:
    def generate_invoice_pdf(self, order):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()

        # Header
        elements.append(Paragraph("AGROMARKET - FARM TO TABLE", styles['Heading1']))
        elements.append(Paragraph("OFFICIAL RETAIL RECEIPT", styles['Heading2']))
        elements.append(Spacer(1, 12))

        # Metadata
        date_str = order.created_at.strftime("%d/%m/%Y %H:%M")
        elements.append(Paragraph(f"<b>Order ID:</b> #{order.id}", styles['Normal']))
        elements.append(Paragraph(f"<b>Date:</b> {date_str}", styles['Normal']))
        elements.append(Paragraph(f"<b>Customer:</b> {_escape_xml(order.customer_name)}", styles['Normal']))
        elements.append(Paragraph(f"<b>Payment Method:</b> Credit Card (Authorized)", styles['Normal']))
        elements.append(Spacer(1, 20))

        # Items Table
        data = [['Product', 'Qty', 'Price', 'VAT (13%)', 'Total']]
        total_vat = 0
        total_net = 0

        for item in order.items:
            # Mock calculations: Assuming price includes VAT for retail
            # Price = Net * 1.13  -> Net = Price / 1.13
            # VAT = Price - Net
            price = item.price
            net = price / 1.13
            vat = price - net
            line_total = price * item.quantity
            
            total_vat += vat * item.quantity
            total_net += net * item.quantity
            
            product_name = _escape_xml(item.product.name) if getattr(item, 'product', None) else f"Product #{item.product_id}"

            data.append([
                product_name,
                str(item.quantity),
                f"{price:.2f}",
                f"{(vat * item.quantity):.2f}",
                f"{line_total:.2f}"
            ])

        # Totals Row
        data.append(['', '', '', '', ''])
        data.append(['', '', 'Total Net:', '', f"{total_net:.2f}"])
        data.append(['', '', 'Total VAT:', '', f"{total_vat:.2f}"])
        data.append(['', '', 'GRAND TOTAL:', '', f"{order.total:.2f}"])

        table = Table(data, colWidths=[200, 50, 60, 80, 80])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'), # Align product names left
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -4), 1, colors.black), # Grid for items
            ('LINEBELOW', (0, -4), (-1, -1), 1, colors.black), # Line above totals
            ('FONTNAME', (-2, -1), (-1, -1), 'Helvetica-Bold'), # Grand Total Bold
        ]))
        elements.append(table)

        elements.append(Spacer(1, 40))
        
        # AADE Signature Mock
        uid = f"AADE-{abs(hash(order.created_at))}-{order.id}"
        elements.append(Paragraph("<b>AADE DIGITAL SIGNATURE</b>", styles['Normal']))
        elements.append(Paragraph(f"<font size=8>{uid}</font>", styles['Normal']))
        elements.append(Paragraph(f"<font size=8>Issued by Agromarket S.A. | VAT: EL099999999</font>", styles['Normal']))

        doc.build(elements)
        buffer.seek(0)
        return buffer
