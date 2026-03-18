# modules/report_generator.py
# Generates downloadable PDF/text reports

from fpdf import FPDF
import os
from datetime import datetime


class BusinessReport(FPDF):
    def header(self):
        self.set_font("Arial", "B", 14)
        self.cell(0, 10, "AI Business Analyst - Performance Report", ln=True, align="C")
        self.set_font("Arial", "", 10)
        self.cell(0, 8, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True, align="C")
        self.ln(5)
        self.set_draw_color(0, 100, 200)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()} | Confidential", align="C")

    def section_title(self, title):
        self.set_font("Arial", "B", 12)
        self.set_fill_color(230, 240, 255)
        self.cell(0, 10, title, ln=True, fill=True)
        self.ln(2)

    def body_text(self, text):
        self.set_font("Arial", "", 10)
        # Handle non-latin characters safely
        safe_text = text.encode("latin-1", "replace").decode("latin-1")
        self.multi_cell(0, 7, safe_text)
        self.ln(3)


def generate_pdf_report(kpis, insights, industry, output_path="reports/report.pdf"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pdf = BusinessReport()
    pdf.add_page()

    # Industry
    pdf.section_title(f"Industry: {industry}")
    pdf.ln(2)

    # KPIs
    pdf.section_title("Key Performance Indicators")
    for k, v in kpis.items():
        if isinstance(v, float):
            pdf.body_text(f"  {k}: {v:,.2f}")
        else:
            pdf.body_text(f"  {k}: {v}")

    # AI Insights
    pdf.section_title("AI-Generated Business Insights")
    pdf.body_text(insights)

    pdf.output(output_path)
    return output_path
