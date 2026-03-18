# modules/charts.py
# All chart generation using Plotly

import plotly.express as px
import plotly.graph_objects as go
import pandas as pd


def sales_trend_chart(monthly_df):
    """Line chart for monthly sales."""
    if monthly_df is None or monthly_df.empty:
        return None
    fig = px.line(
        monthly_df, x="Month", y="Sales",
        title="📈 Monthly Sales Trend",
        markers=True,
        line_shape="spline"
    )
    fig.update_layout(
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        font_color="white",
        xaxis=dict(tickangle=45),
    )
    fig.update_traces(line_color="#00d4ff", marker_color="#ff4b4b")
    return fig


def category_bar_chart(cat_df, sales_col, profit_col=None):
    """Grouped bar chart for category performance."""
    if cat_df is None or cat_df.empty:
        return None

    cat_df = cat_df.reset_index()
    cols = [sales_col]
    if profit_col and profit_col in cat_df.columns:
        cols.append(profit_col)

    fig = px.bar(
        cat_df,
        x=cat_df.columns[0],
        y=cols,
        title="📂 Category Performance",
        barmode="group",
        color_discrete_sequence=["#00d4ff", "#ff4b4b"]
    )
    fig.update_layout(
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        font_color="white",
    )
    return fig


def profit_margin_gauge(margin_pct):
    """Gauge chart for profit margin."""
    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=round(margin_pct * 100, 2),
        title={"text": "Profit Margin %", "font": {"color": "white"}},
        delta={"reference": 20},
        gauge={
            "axis": {"range": [0, 50], "tickcolor": "white"},
            "bar": {"color": "#00d4ff"},
            "steps": [
                {"range": [0, 10], "color": "#ff4b4b"},
                {"range": [10, 25], "color": "#ffa500"},
                {"range": [25, 50], "color": "#00ff88"},
            ],
            "threshold": {
                "line": {"color": "white", "width": 4},
                "thickness": 0.75,
                "value": margin_pct * 100
            }
        },
        number={"suffix": "%", "font": {"color": "white"}}
    ))
    fig.update_layout(
        paper_bgcolor="#0e1117",
        font_color="white",
        height=250
    )
    return fig


def anomaly_chart(anomaly_df):
    """Sales chart with anomalies highlighted."""
    if anomaly_df is None or anomaly_df.empty:
        return None

    colors = anomaly_df["Status"].map({
        "✅ Normal": "#00d4ff",
        "⚠️ Anomaly": "#ff4b4b"
    })

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=anomaly_df["Month"],
        y=anomaly_df["Sales"],
        mode="lines+markers",
        line=dict(color="#00d4ff", width=2),
        marker=dict(color=colors, size=10),
        name="Sales"
    ))
    fig.update_layout(
        title="⚠️ Sales Anomaly Detection",
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        font_color="white",
        xaxis=dict(tickangle=45),
    )
    return fig


def forecast_chart(historical_df, forecast_df):
    """Combined historical + forecast chart."""
    if forecast_df is None:
        return None

    fig = go.Figure()

    if historical_df is not None:
        fig.add_trace(go.Scatter(
            x=historical_df["Month"],
            y=historical_df["Sales"],
            mode="lines+markers",
            name="Historical",
            line=dict(color="#00d4ff")
        ))

    fig.add_trace(go.Scatter(
        x=forecast_df["Period"],
        y=forecast_df["Forecasted Sales"],
        mode="lines+markers",
        name="Forecast",
        line=dict(color="#ff4b4b", dash="dash"),
        marker=dict(symbol="star", size=12)
    ))

    fig.update_layout(
        title="🔮 Sales Forecast",
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        font_color="white",
    )
    return fig


def regional_map_chart(regional_df):
    """Bar chart for regional performance."""
    if regional_df is None or regional_df.empty:
        return None

    regional_df = regional_df.reset_index()
    fig = px.bar(
        regional_df,
        x=regional_df.columns[0],
        y=regional_df.columns[1],
        title="🗺️ Regional Performance",
        color=regional_df.columns[1],
        color_continuous_scale="Blues"
    )
    fig.update_layout(
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        font_color="white",
    )
    return fig


def kpi_sparkline(monthly_df):
    """Small sparkline for KPI trend."""
    if monthly_df is None or monthly_df.empty:
        return None
    fig = px.area(monthly_df, x="Month", y="Sales")
    fig.update_layout(
        height=100,
        margin=dict(l=0, r=0, t=0, b=0),
        showlegend=False,
        plot_bgcolor="#0e1117",
        paper_bgcolor="#0e1117",
        xaxis=dict(visible=False),
        yaxis=dict(visible=False),
    )
    fig.update_traces(line_color="#00d4ff", fillcolor="rgba(0,212,255,0.2)")
    return fig
