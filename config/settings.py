# config/settings.py
# Central configuration for the entire application

import os
from dotenv import load_dotenv

load_dotenv()

# ── API Keys ──────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_API_KEY   = os.getenv("HF_API_KEY")

# ── AI Model Settings ─────────────────────────────────────
GROQ_MODEL       = "llama-3.1-8b-instant"
MAX_TOKENS       = 800
TEMPERATURE      = 0.7

# ── App Settings ──────────────────────────────────────────
APP_TITLE        = "AI Personal Business Analyst"
APP_ICON         = "🤖"
APP_LAYOUT       = "wide"

# ── Supported Industries ──────────────────────────────────
INDUSTRIES = [
    "General / Retail",
    "Logistics",
    "Oil & Energy",
    "Real Estate",
    "Marketing & Advertising",
    "Finance",
    "Manufacturing",
    "E-commerce",
]

# ── Industry-specific KPI configs ─────────────────────────
INDUSTRY_KPIS = {
    "General / Retail": ["Sales", "Profit", "Orders", "Profit Margin"],
    "Logistics":        ["Revenue", "Fuel Cost", "Delivery Time", "Fleet Utilization"],
    "Finance":          ["Revenue", "Expenses", "Net Income", "ROI"],
    "Real Estate":      ["Revenue", "Profit", "Rental Yield", "Occupancy Rate"],
    "Marketing & Advertising": ["Revenue", "Ad Spend", "ROI", "Leads"],
    "Oil & Energy":     ["Revenue", "Production Cost", "Output", "Efficiency"],
    "Manufacturing":    ["Revenue", "COGS", "Units Produced", "Defect Rate"],
    "E-commerce":       ["Sales", "Profit", "Orders", "Return Rate"],
}
