# 🤖 AI Personal Business Analyst

A full AI-powered business chatbot and dashboard for any industry.

## 🚀 Setup (Step by Step)

### Step 1: Create Project Folder
```
mkdir ai-business-analyst
cd ai-business-analyst
```

### Step 2: Create Virtual Environment
```
python -m venv .venv
```

### Step 3: Activate Virtual Environment
Windows:
```
.venv\Scripts\activate
```
Mac/Linux:
```
source .venv/bin/activate
```

### Step 4: Install All Packages
```
pip install -r requirements.txt
```

### Step 5: Set Up API Keys
```
copy .env.example .env
```
Then open .env and fill in your keys:
- GROQ_API_KEY  → get free at https://console.groq.com
- HF_API_KEY    → get free at https://huggingface.co/settings/tokens

### Step 6: Run the App
```
streamlit run app.py
```

## 📁 Project Structure

```
ai-business-analyst/
├── app.py                     ← Main Streamlit app
├── requirements.txt           ← All packages
├── .env                       ← Your API keys (never share this)
├── config/
│   └── settings.py            ← App configuration
├── modules/
│   ├── data_loader.py         ← CSV/Excel/SQL loader
│   ├── analysis.py            ← KPIs, forecast, anomaly detection
│   ├── ai_engine.py           ← Groq AI / LLM layer
│   ├── industry_config.py     ← Industry-specific settings
│   └── report_generator.py    ← PDF report generation
├── utils/
│   └── charts.py              ← Plotly charts
└── reports/                   ← Auto-saved PDF reports
```

## 🏭 Supported Industries
- General / Retail
- Logistics
- Finance
- Real Estate
- Marketing & Advertising
- Oil & Energy
- Manufacturing
- E-commerce

## ✨ Features
- Upload CSV or Excel files
- Auto-detects columns and data types
- Computes KPIs instantly
- Revenue trend charts
- Category performance analysis
- ML-based sales forecasting
- Anomaly detection
- AI chatbot with memory
- Industry-specific advice
- Weekly report generation
- PDF export
- Chat history download
