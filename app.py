# app.py
# Main Streamlit Application - AI Personal Business Analyst Chatbot

import streamlit as st
import pandas as pd
import os

from config.settings import APP_TITLE, APP_ICON, APP_LAYOUT, INDUSTRIES
from modules.data_loader import load_csv, load_excel, summarize_dataframe, get_numeric_columns, get_date_columns
from modules.analysis import (
    compute_kpis, category_breakdown, time_series,
    forecast, detect_anomalies, profit_loss_diagnosis,
    top_bottom_performers
)
from modules.ai_engine import ask_ai, build_system_prompt, generate_auto_insights, generate_weekly_report
from modules.industry_config import get_industry_prompt, get_suggested_questions
from modules.report_generator import generate_pdf_report
from utils.charts import line_chart, bar_chart, pie_chart, forecast_chart, anomaly_chart

# ── Page Config ───────────────────────────────────────────
st.set_page_config(page_title=APP_TITLE, page_icon=APP_ICON, layout=APP_LAYOUT)

# ── Session State Init ────────────────────────────────────
for key, default in {
    "messages":     [],
    "df":           None,
    "context":      "",
    "kpis":         {},
    "industry":     "General / Retail",
    "col_config":   {},
    "data_ready":   False,
    "insights":     "",
}.items():
    if key not in st.session_state:
        st.session_state[key] = default

# ── Sidebar ───────────────────────────────────────────────
with st.sidebar:
    st.title(f"{APP_ICON} AI Business Analyst")
    st.divider()

    # Industry Selection
    st.subheader("🏭 Select Industry")
    industry = st.selectbox("Industry", INDUSTRIES, index=0)
    st.session_state.industry = industry

    st.divider()

    # Data Upload
    st.subheader("📂 Upload Business Data")
    file_type = st.radio("File type", ["CSV", "Excel"])
    uploaded  = st.file_uploader(
        f"Upload {file_type} file",
        type=["csv"] if file_type == "CSV" else ["xlsx", "xls"]
    )

    if uploaded:
        with st.spinner("Loading data..."):
            try:
                df = load_csv(uploaded) if file_type == "CSV" else load_excel(uploaded)
                st.session_state.df = df
                st.success(f"✅ Loaded {len(df):,} rows")
            except Exception as e:
                st.error(str(e))

    # Column Mapping (only show when data is loaded)
    if st.session_state.df is not None:
        df = st.session_state.df
        num_cols  = ["(none)"] + get_numeric_columns(df)
        date_cols = ["(none)"] + get_date_columns(df)
        cat_cols  = ["(none)"] + df.select_dtypes(include=["object"]).columns.tolist()

        st.divider()
        st.subheader("🔧 Map Your Columns")
        sales_col    = st.selectbox("Revenue / Sales column",  num_cols)
        profit_col   = st.selectbox("Profit column",           num_cols)
        date_col     = st.selectbox("Date column",             date_cols)
        category_col = st.selectbox("Category column",         cat_cols)

        st.session_state.col_config = {
            "sales":    sales_col    if sales_col    != "(none)" else None,
            "profit":   profit_col   if profit_col   != "(none)" else None,
            "date":     date_col     if date_col     != "(none)" else None,
            "category": category_col if category_col != "(none)" else None,
        }

        if st.button("🚀 Analyze Data", type="primary"):
            with st.spinner("Running analysis..."):
                cfg = st.session_state.col_config

                # Compute KPIs
                kpis = compute_kpis(
                    df,
                    sales_col=cfg["sales"],
                    profit_col=cfg["profit"],
                    order_col=None
                )
                st.session_state.kpis = kpis

                # P&L Diagnosis
                pnl = profit_loss_diagnosis(df, cfg["sales"], cfg["profit"], cfg["date"])

                # Top/Bottom performers
                top_str = ""
                if cfg["category"] and cfg["sales"]:
                    top, bot = top_bottom_performers(df, cfg["category"], cfg["sales"])
                    top_str = f"\nTop performers:\n{top.to_string()}\nBottom performers:\n{bot.to_string()}"

                # Forecast
                fc_vals = []
                if cfg["date"] and cfg["sales"]:
                    fc_vals = forecast(df, cfg["date"], cfg["sales"])

                # Anomalies
                anom_count = 0
                if cfg["date"] and cfg["sales"]:
                    anom = detect_anomalies(df, cfg["date"], cfg["sales"])
                    anom_count = len(anom)

                # Build AI context
                industry_info = get_industry_prompt(st.session_state.industry)
                context = f"""
Industry: {st.session_state.industry}
{industry_info}

KPIs:
{chr(10).join([f'- {k}: {v}' for k, v in kpis.items()])}

{pnl}
{top_str}

Forecast (next 3 periods): {fc_vals}
Anomalous periods detected: {anom_count}

Dataset: {len(df):,} rows, {len(df.columns)} columns
Columns available: {', '.join(df.columns.tolist())}
"""
                st.session_state.context = context

                # Auto insights
                insights = generate_auto_insights(context, st.session_state.industry)
                st.session_state.insights = insights
                st.session_state.data_ready = True

                # Reset chat and add welcome
                st.session_state.messages = [{
                    "role": "assistant",
                    "content": f"✅ **Data analyzed!** I found {len(kpis)} KPIs across {len(df):,} records.\n\n**Auto Insights:**\n{insights}\n\nAsk me anything about your business! 👇"
                }]
                st.rerun()

    st.divider()
    if st.button("🗑️ Clear Chat"):
        st.session_state.messages = []
        st.rerun()

# ── Main Content ──────────────────────────────────────────
if not st.session_state.data_ready:
    # Landing screen
    st.title(f"{APP_ICON} {APP_TITLE}")
    st.markdown("### Your AI-powered Business Analyst, Advisor & Chatbot")
    st.divider()

    col1, col2, col3 = st.columns(3)
    col1.info("**📂 Step 1**\nUpload your business data (CSV or Excel) from the sidebar")
    col2.info("**🔧 Step 2**\nMap your columns (Sales, Profit, Date, Category)")
    col3.info("**🚀 Step 3**\nClick Analyze and start chatting with your AI analyst")

    st.divider()
    st.subheader("💡 What can I do?")
    features = [
        ("📊", "KPI Analysis",        "Instantly computes Revenue, Profit, Margin and more"),
        ("📈", "Trend Detection",     "Spots monthly and seasonal trends in your data"),
        ("🔮", "Sales Forecasting",   "Predicts next month revenue using ML"),
        ("⚠️", "Anomaly Detection",   "Flags unusual spikes or drops automatically"),
        ("🤖", "AI Q&A Chat",         "Ask any business question in plain English"),
        ("📋", "Report Generation",   "Download a PDF report of all insights"),
        ("🏭", "Industry Tailored",   "Customized for Retail, Logistics, Finance & more"),
        ("💬", "Memory Chat",         "Remembers full conversation context"),
    ]
    cols = st.columns(4)
    for i, (icon, title, desc) in enumerate(features):
        cols[i % 4].success(f"**{icon} {title}**\n{desc}")

else:
    # Dashboard + Chat
    df  = st.session_state.df
    cfg = st.session_state.col_config
    kpis = st.session_state.kpis

    # ── Tabs ──────────────────────────────────────────────
    tab1, tab2, tab3 = st.tabs(["💬 AI Chat", "📊 Dashboard", "📋 Reports"])

    # ─── TAB 1: CHAT ──────────────────────────────────────
    with tab1:
        st.subheader("🤖 Ask Your AI Business Advisor")

        # Suggested questions
        suggestions = get_suggested_questions(st.session_state.industry)
        st.markdown("**Quick questions:**")
        q_cols = st.columns(len(suggestions))
        for i, q in enumerate(suggestions):
            if q_cols[i].button(q, key=f"sq_{i}"):
                st.session_state.messages.append({"role": "user", "content": q})
                full_msgs = [{"role": "system", "content": build_system_prompt(st.session_state.industry, st.session_state.context)}]
                full_msgs += st.session_state.messages
                reply = ask_ai(full_msgs)
                st.session_state.messages.append({"role": "assistant", "content": reply})
                st.rerun()

        st.divider()

        # Chat history
        chat_container = st.container()
        with chat_container:
            for msg in st.session_state.messages:
                with st.chat_message(msg["role"]):
                    st.markdown(msg["content"])

        # Chat input
        if prompt := st.chat_input("Ask a business question..."):
            st.session_state.messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)

            full_msgs = [{"role": "system", "content": build_system_prompt(st.session_state.industry, st.session_state.context)}]
            full_msgs += st.session_state.messages

            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    reply = ask_ai(full_msgs)
                    st.markdown(reply)

            st.session_state.messages.append({"role": "assistant", "content": reply})
            st.rerun()

    # ─── TAB 2: DASHBOARD ─────────────────────────────────
    with tab2:
        st.subheader("📊 Business Dashboard")

        # KPI Cards
        if kpis:
            kpi_items = list(kpis.items())
            cols = st.columns(min(len(kpi_items), 4))
            for i, (k, v) in enumerate(kpi_items):
                if isinstance(v, float) and v < 1:
                    cols[i % 4].metric(k, f"{v:.1%}")
                elif isinstance(v, float):
                    cols[i % 4].metric(k, f"${v:,.2f}")
                else:
                    cols[i % 4].metric(k, f"{v:,}")

        st.divider()

        col_left, col_right = st.columns(2)

        # Time series chart
        with col_left:
            if cfg["date"] and cfg["sales"]:
                ts = time_series(df, cfg["date"], cfg["sales"])
                if not ts.empty:
                    st.plotly_chart(line_chart(ts, cfg["date"], cfg["sales"], "Revenue Trend"), use_container_width=True)

        # Category chart
        with col_right:
            if cfg["category"] and cfg["sales"]:
                cat = category_breakdown(df, cfg["category"], [cfg["sales"]])
                if not cat.empty:
                    st.plotly_chart(bar_chart(cat.reset_index(), cfg["category"], cfg["sales"], "Category Performance"), use_container_width=True)

        col_left2, col_right2 = st.columns(2)

        # Forecast chart
        with col_left2:
            if cfg["date"] and cfg["sales"]:
                fc_vals = forecast(df, cfg["date"], cfg["sales"])
                ts = time_series(df, cfg["date"], cfg["sales"])
                if fc_vals and not ts.empty:
                    st.plotly_chart(forecast_chart(ts, cfg["date"], cfg["sales"], fc_vals), use_container_width=True)

        # Anomaly chart
        with col_right2:
            if cfg["date"] and cfg["sales"]:
                ts = time_series(df, cfg["date"], cfg["sales"])
                anom = detect_anomalies(df, cfg["date"], cfg["sales"])
                if not ts.empty:
                    st.plotly_chart(anomaly_chart(ts, cfg["date"], cfg["sales"], anom), use_container_width=True)

        # Raw data preview
        with st.expander("🔍 View Raw Data"):
            st.dataframe(df.head(100), use_container_width=True)

    # ─── TAB 3: REPORTS ───────────────────────────────────
    with tab3:
        st.subheader("📋 Automated Business Reports")

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("#### 📄 Weekly Performance Report")
            if st.button("Generate Weekly Report"):
                with st.spinner("Generating report..."):
                    report = generate_weekly_report(st.session_state.context, st.session_state.industry)
                    st.markdown(report)
                    st.download_button("⬇️ Download as Text", report, file_name="weekly_report.txt")

        with col2:
            st.markdown("#### 📊 PDF Summary Report")
            if st.button("Generate PDF Report"):
                with st.spinner("Building PDF..."):
                    insights = st.session_state.insights
                    path = generate_pdf_report(kpis, insights, st.session_state.industry)
                    with open(path, "rb") as f:
                        st.download_button("⬇️ Download PDF", f, file_name="business_report.pdf", mime="application/pdf")

        st.divider()
        st.markdown("#### 💬 Export Chat History")
        if st.session_state.messages:
            chat_text = "\n\n".join([f"{m['role'].upper()}: {m['content']}" for m in st.session_state.messages])
            st.download_button("⬇️ Download Chat", chat_text, file_name="chat_history.txt")

