# app_final.py
# COMPLETE AI Business Analyst — All features integrated

import streamlit as st
import pandas as pd
import os

# ── Config & Auth ─────────────────────────────────────────
from config.settings import APP_TITLE, APP_ICON, APP_LAYOUT, INDUSTRIES
from auth.auth import require_login, logout, has_permission

# ── Data & Analysis ───────────────────────────────────────
from modules.data_loader import (
    load_csv, load_excel, get_numeric_columns,
    get_date_columns, summarize_dataframe
)
from modules.analysis import (
    compute_kpis, category_breakdown, time_series,
    forecast, detect_anomalies, profit_loss_diagnosis,
    top_bottom_performers
)
from connectors.multi_source import load_multiple_files, load_from_sqlite, list_sqlite_tables

# ── AI Engine ─────────────────────────────────────────────
from modules.ai_engine import (
    ask_ai, build_system_prompt,
    generate_auto_insights, generate_weekly_report
)
from modules.industry_config import get_industry_prompt, get_suggested_questions

# ── Reports & Charts ──────────────────────────────────────
from modules.report_generator import generate_pdf_report
from utils.charts import line_chart, bar_chart, forecast_chart, anomaly_chart

# ── Database ──────────────────────────────────────────────
from database.db import (
    init_db, save_chat_message, get_chat_history,
    save_report, get_reports, log_upload
)

# ── Scheduler ─────────────────────────────────────────────
from scheduler.report_scheduler import (
    start_scheduler, schedule_weekly, get_scheduled_jobs
)

# ══════════════════════════════════════════════════════════
# INIT
# ══════════════════════════════════════════════════════════
st.set_page_config(page_title=APP_TITLE, page_icon=APP_ICON, layout=APP_LAYOUT)
init_db()

# ── Require Login ─────────────────────────────────────────
require_login()
user     = st.session_state.user
username = user["username"]
role     = user["role"]

# ── Session State ─────────────────────────────────────────
for key, default in {
    "messages":   [],
    "df":         None,
    "context":    "",
    "kpis":       {},
    "industry":   "General / Retail",
    "col_config": {},
    "data_ready": False,
    "insights":   "",
    "forecast_vals": [],
}.items():
    if key not in st.session_state:
        st.session_state[key] = default

# ══════════════════════════════════════════════════════════
# SIDEBAR
# ══════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown(f"### {APP_ICON} AI Business Analyst")
    st.markdown(f"👤 **{user['name']}** `{role}`")

    if st.button("🚪 Logout", use_container_width=True):
        logout()

    st.divider()

    # ── Industry ──────────────────────────────────────────
    st.subheader("🏭 Industry")
    industry = st.selectbox("Select", INDUSTRIES)
    st.session_state.industry = industry

    st.divider()

    # ── Data Upload (only if permitted) ───────────────────
    if has_permission(role, "upload"):
        st.subheader("📂 Upload Data")

        upload_mode = st.radio("Mode", ["Single File", "Multiple Files", "SQLite DB"])

        if upload_mode == "Single File":
            file_type = st.radio("Type", ["CSV", "Excel"])
            uploaded = st.file_uploader(
                "Upload file",
                type=["csv"] if file_type == "CSV" else ["xlsx", "xls"]
            )
            if uploaded:
                try:
                    df = load_csv(uploaded) if file_type == "CSV" else load_excel(uploaded)
                    st.session_state.df = df
                    log_upload(username, uploaded.name, len(df), len(df.columns), industry)
                    st.success(f"✅ {len(df):,} rows loaded")
                except Exception as e:
                    st.error(str(e))

        elif upload_mode == "Multiple Files":
            files = st.file_uploader("Upload multiple files",
                                     type=["csv", "xlsx"],
                                     accept_multiple_files=True)
            if files:
                try:
                    df = load_multiple_files(files)
                    st.session_state.df = df
                    st.success(f"✅ Combined {len(files)} files → {len(df):,} rows")
                except Exception as e:
                    st.error(str(e))

        elif upload_mode == "SQLite DB":
            db_file = st.file_uploader("Upload .db file", type=["db", "sqlite"])
            if db_file:
                # Save temporarily
                tmp_path = f"/tmp/{db_file.name}"
                with open(tmp_path, "wb") as f:
                    f.write(db_file.read())
                tables = list_sqlite_tables(tmp_path)
                if tables:
                    chosen = st.selectbox("Select table", tables)
                    if st.button("Load Table"):
                        df = load_from_sqlite(tmp_path, chosen)
                        st.session_state.df = df
                        st.success(f"✅ Loaded {len(df):,} rows from {chosen}")

    # ── Column Mapping ────────────────────────────────────
    if st.session_state.df is not None:
        df = st.session_state.df
        num_cols  = ["(none)"] + get_numeric_columns(df)
        date_cols = ["(none)"] + get_date_columns(df)
        cat_cols  = ["(none)"] + df.select_dtypes(include=["object"]).columns.tolist()

        st.divider()
        st.subheader("🔧 Map Columns")
        sales_col    = st.selectbox("Revenue/Sales",  num_cols)
        profit_col   = st.selectbox("Profit",         num_cols)
        date_col     = st.selectbox("Date",           date_cols)
        category_col = st.selectbox("Category",       cat_cols)

        st.session_state.col_config = {
            "sales":    sales_col    if sales_col    != "(none)" else None,
            "profit":   profit_col   if profit_col   != "(none)" else None,
            "date":     date_col     if date_col     != "(none)" else None,
            "category": category_col if category_col != "(none)" else None,
        }

        if st.button("🚀 Analyze Data", type="primary", use_container_width=True):
            with st.spinner("Analyzing..."):
                cfg = st.session_state.col_config

                # KPIs
                kpis = compute_kpis(df, cfg["sales"], cfg["profit"])
                st.session_state.kpis = kpis

                # P&L
                pnl = profit_loss_diagnosis(df, cfg["sales"], cfg["profit"], cfg["date"])

                # Top performers
                top_str = ""
                if cfg["category"] and cfg["sales"]:
                    top, bot = top_bottom_performers(df, cfg["category"], cfg["sales"])
                    top_str = f"\nTop:\n{top.to_string()}\nBottom:\n{bot.to_string()}"

                # Forecast
                fc_vals = []
                if cfg["date"] and cfg["sales"]:
                    fc_vals = forecast(df, cfg["date"], cfg["sales"])
                    st.session_state.forecast_vals = fc_vals

                # Anomalies
                anom_count = 0
                if cfg["date"] and cfg["sales"]:
                    anom = detect_anomalies(df, cfg["date"], cfg["sales"])
                    anom_count = len(anom)

                # Context for AI
                industry_info = get_industry_prompt(st.session_state.industry)
                context = f"""
Industry: {st.session_state.industry}
{industry_info}
KPIs: {chr(10).join([f'- {k}: {v}' for k, v in kpis.items()])}
{pnl}
{top_str}
Forecast next 3 months: {fc_vals}
Anomalies detected: {anom_count}
Dataset: {len(df):,} rows, columns: {', '.join(df.columns.tolist())}
"""
                st.session_state.context = context

                # Auto insights
                insights = generate_auto_insights(context, st.session_state.industry)
                st.session_state.insights = insights
                st.session_state.data_ready = True

                # Welcome message
                welcome = f"✅ **Analysis complete!**\n\n**Auto Insights:**\n{insights}\n\nAsk me anything! 👇"
                st.session_state.messages = [{"role": "assistant", "content": welcome}]
                save_chat_message(username, industry, "assistant", welcome)
                st.rerun()

    st.divider()
    if st.button("🗑️ Clear Chat", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

# ══════════════════════════════════════════════════════════
# MAIN CONTENT
# ══════════════════════════════════════════════════════════
if not st.session_state.data_ready:
    # ── Landing Page ──────────────────────────────────────
    st.title(f"{APP_ICON} {APP_TITLE}")
    st.markdown(f"### Welcome, **{user['name']}**! Your role: `{role}`")
    st.divider()

    c1, c2, c3 = st.columns(3)
    c1.info("**📂 Step 1:** Upload CSV, Excel, or SQLite from sidebar")
    c2.info("**🔧 Step 2:** Map your columns (Sales, Profit, Date)")
    c3.info("**🚀 Step 3:** Click Analyze and start chatting")

    st.divider()
    st.subheader("✨ All Features")
    features = [
        ("🔐", "Login & Roles",        "4 user roles — Admin, CEO, Analyst, Viewer"),
        ("📂", "Multi-file Upload",    "CSV, Excel, SQLite, multiple files at once"),
        ("📊", "Auto KPI Dashboard",   "Revenue, Profit, Margin computed instantly"),
        ("📈", "Trend Charts",         "Monthly trends with interactive Plotly charts"),
        ("🔮", "ML Forecasting",       "Predicts next 3 months using Linear Regression"),
        ("⚠️", "Anomaly Detection",    "Isolation Forest flags unusual periods"),
        ("🤖", "AI Chatbot",           "Full conversation memory with Groq LLaMA AI"),
        ("🏭", "8 Industries",         "Retail, Logistics, Finance, Real Estate & more"),
        ("📋", "PDF Reports",          "Download full business report as PDF"),
        ("💾", "Chat History DB",      "All chats saved to SQLite database"),
        ("⏰", "Auto Scheduler",       "Weekly/monthly reports generated automatically"),
        ("👥", "Role-based Access",    "Features restricted by user role"),
    ]
    cols = st.columns(4)
    for i, (icon, title, desc) in enumerate(features):
        cols[i % 4].success(f"**{icon} {title}**\n\n{desc}")

else:
    df   = st.session_state.df
    cfg  = st.session_state.col_config
    kpis = st.session_state.kpis

    # ── Tabs ──────────────────────────────────────────────
    tabs = ["💬 AI Chat", "📊 Dashboard", "📋 Reports", "💾 History"]
    if role == "admin":
        tabs.append("⚙️ Admin")

    tab_objects = st.tabs(tabs)

    # ══════════════════════════════════════════════════════
    # TAB 1 — CHAT
    # ══════════════════════════════════════════════════════
    with tab_objects[0]:
        st.subheader("🤖 AI Business Advisor")

        # Suggested questions
        suggestions = get_suggested_questions(st.session_state.industry)
        st.markdown("**Quick questions:**")
        q_cols = st.columns(len(suggestions))
        for i, q in enumerate(suggestions):
            if q_cols[i].button(q, key=f"sq_{i}"):
                st.session_state.messages.append({"role": "user", "content": q})
                save_chat_message(username, industry, "user", q)
                msgs = [{"role": "system", "content": build_system_prompt(
                    st.session_state.industry, st.session_state.context)}]
                msgs += st.session_state.messages
                reply = ask_ai(msgs)
                st.session_state.messages.append({"role": "assistant", "content": reply})
                save_chat_message(username, industry, "assistant", reply)
                st.rerun()

        st.divider()

        # Chat messages
        for msg in st.session_state.messages:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])

        # Input
        if prompt := st.chat_input("Ask a business question..."):
            st.session_state.messages.append({"role": "user", "content": prompt})
            save_chat_message(username, industry, "user", prompt)

            with st.chat_message("user"):
                st.markdown(prompt)

            msgs = [{"role": "system", "content": build_system_prompt(
                st.session_state.industry, st.session_state.context)}]
            msgs += st.session_state.messages

            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    reply = ask_ai(msgs)
                    st.markdown(reply)

            st.session_state.messages.append({"role": "assistant", "content": reply})
            save_chat_message(username, industry, "assistant", reply)
            st.rerun()

    # ══════════════════════════════════════════════════════
    # TAB 2 — DASHBOARD
    # ══════════════════════════════════════════════════════
    with tab_objects[1]:
        st.subheader("📊 Business Dashboard")

        # KPI Cards
        if kpis:
            cols = st.columns(min(len(kpis), 4))
            for i, (k, v) in enumerate(kpis.items()):
                if isinstance(v, float) and v < 1:
                    cols[i % 4].metric(k, f"{v:.1%}")
                elif isinstance(v, float):
                    cols[i % 4].metric(k, f"${v:,.2f}")
                else:
                    cols[i % 4].metric(k, f"{v:,}")

        st.divider()
        cl, cr = st.columns(2)

        with cl:
            if cfg["date"] and cfg["sales"]:
                ts = time_series(df, cfg["date"], cfg["sales"])
                if not ts.empty:
                    st.plotly_chart(
                        line_chart(ts, cfg["date"], cfg["sales"], "Revenue Trend"),
                        use_container_width=True
                    )

        with cr:
            if cfg["category"] and cfg["sales"]:
                cat = category_breakdown(df, cfg["category"], [cfg["sales"]])
                if not cat.empty:
                    st.plotly_chart(
                        bar_chart(cat.reset_index(), cfg["category"],
                                  cfg["sales"], "Category Performance"),
                        use_container_width=True
                    )

        cl2, cr2 = st.columns(2)

        with cl2:
            if cfg["date"] and cfg["sales"] and st.session_state.forecast_vals:
                ts = time_series(df, cfg["date"], cfg["sales"])
                st.plotly_chart(
                    forecast_chart(ts, cfg["date"], cfg["sales"],
                                   st.session_state.forecast_vals),
                    use_container_width=True
                )

        with cr2:
            if cfg["date"] and cfg["sales"]:
                ts   = time_series(df, cfg["date"], cfg["sales"])
                anom = detect_anomalies(df, cfg["date"], cfg["sales"])
                if not ts.empty:
                    st.plotly_chart(
                        anomaly_chart(ts, cfg["date"], cfg["sales"], anom),
                        use_container_width=True
                    )

        with st.expander("🔍 Raw Data Preview"):
            st.dataframe(df.head(200), use_container_width=True)

    # ══════════════════════════════════════════════════════
    # TAB 3 — REPORTS
    # ══════════════════════════════════════════════════════
    with tab_objects[2]:
        st.subheader("📋 Reports & Exports")

        c1, c2 = st.columns(2)

        with c1:
            st.markdown("#### 📄 Weekly Report")
            if st.button("Generate Weekly Report"):
                with st.spinner("Generating..."):
                    report = generate_weekly_report(
                        st.session_state.context, st.session_state.industry
                    )
                    save_report(username, "Weekly", st.session_state.industry, report)
                    st.markdown(report)
                    st.download_button("⬇️ Download TXT", report,
                                       file_name="weekly_report.txt")

        with c2:
            st.markdown("#### 📊 PDF Report")
            if st.button("Generate PDF"):
                with st.spinner("Building PDF..."):
                    path = generate_pdf_report(
                        kpis, st.session_state.insights,
                        st.session_state.industry
                    )
                    with open(path, "rb") as f:
                        st.download_button("⬇️ Download PDF", f,
                                           file_name="business_report.pdf",
                                           mime="application/pdf")

        st.divider()
        st.markdown("#### ⏰ Auto Schedule Reports")
        col1, col2, col3 = st.columns(3)
        with col1:
            sched_day  = st.selectbox("Day", ["monday","tuesday","wednesday",
                                               "thursday","friday"])
        with col2:
            sched_time = st.text_input("Time (HH:MM)", value="08:00")
        with col3:
            st.markdown("&nbsp;")
            if st.button("Schedule Weekly"):
                schedule_weekly(
                    st.session_state.context,
                    st.session_state.industry,
                    username, sched_day, sched_time
                )
                start_scheduler()
                st.success(f"✅ Scheduled every {sched_day} at {sched_time}")

        active = get_scheduled_jobs()
        if active:
            st.info(f"Active schedules: {len(active)}")

        st.divider()
        st.markdown("#### 💬 Export Chat")
        if st.session_state.messages:
            chat_text = "\n\n".join(
                [f"{m['role'].upper()}: {m['content']}"
                 for m in st.session_state.messages]
            )
            st.download_button("⬇️ Download Chat History",
                               chat_text, file_name="chat.txt")

    # ══════════════════════════════════════════════════════
    # TAB 4 — HISTORY
    # ══════════════════════════════════════════════════════
    with tab_objects[3]:
        st.subheader("💾 Saved History")

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("#### 💬 Past Conversations")
            history = get_chat_history(username, limit=20)
            if history:
                for role_h, msg, ts in reversed(history):
                    with st.chat_message(role_h):
                        st.markdown(f"*{ts[:16]}*\n\n{msg}")
            else:
                st.info("No chat history yet.")

        with col2:
            st.markdown("#### 📋 Saved Reports")
            reports = get_reports(username)
            if reports:
                for rtype, ind, content, ts in reports:
                    with st.expander(f"{rtype} — {ind} ({ts[:10]})"):
                        st.markdown(content)
            else:
                st.info("No saved reports yet.")

    # ══════════════════════════════════════════════════════
    # TAB 5 — ADMIN (admin only)
    # ══════════════════════════════════════════════════════
    if role == "admin" and len(tab_objects) > 4:
        with tab_objects[4]:
            st.subheader("⚙️ Admin Panel")

            st.markdown("#### 👥 User Roles & Permissions")
            from auth.auth import USERS, ROLE_PERMISSIONS
            users_data = [
                {"Username": u, "Role": d["role"]}
                for u, d in USERS.items()
            ]
            st.dataframe(pd.DataFrame(users_data), use_container_width=True)

            st.divider()
            st.markdown("#### 🔐 Role Permissions")
            perms = [
                {"Role": r, "Permissions": ", ".join(p)}
                for r, p in ROLE_PERMISSIONS.items()
            ]
            st.dataframe(pd.DataFrame(perms), use_container_width=True)

            st.divider()
            st.markdown("#### ⏰ Active Scheduled Jobs")
            jobs = get_scheduled_jobs()
            if jobs:
                for j in jobs:
                    st.code(j)
            else:
                st.info("No active scheduled jobs.")
