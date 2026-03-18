# utils/charts.py
# All chart/visualization functions using Plotly

import plotly.express as px
import plotly.graph_objects as go
import pandas as pd


def line_chart(df, x_col, y_col, title="Trend"):
    fig = px.line(df, x=x_col, y=y_col, title=title, markers=True)
    fig.update_layout(xaxis_tickangle=-45, height=400)
    return fig


def bar_chart(df, x_col, y_col, title="Performance", color=None):
    fig = px.bar(df.reset_index() if df.index.name else df,
                 x=x_col, y=y_col, title=title, color=color,
                 color_discrete_sequence=px.colors.qualitative.Set2)
    fig.update_layout(height=400)
    return fig


def pie_chart(df, names_col, values_col, title="Distribution"):
    fig = px.pie(df.reset_index() if df.index.name else df,
                 names=names_col, values=values_col, title=title,
                 hole=0.3)
    return fig


def forecast_chart(historical_df, date_col, value_col, forecast_values):
    """Plot historical data + forecast as dashed line."""
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=historical_df[date_col],
        y=historical_df[value_col],
        mode="lines+markers",
        name="Historical",
        line=dict(color="royalblue", width=2)
    ))

    last_date = historical_df[date_col].iloc[-1]
    future_labels = [f"Forecast +{i+1}" for i in range(len(forecast_values))]

    fig.add_trace(go.Scatter(
        x=future_labels,
        y=forecast_values,
        mode="lines+markers",
        name="Forecast",
        line=dict(color="orange", width=2, dash="dash")
    ))

    fig.update_layout(title="Sales Forecast", height=400)
    return fig


def anomaly_chart(df, date_col, value_col, anomalies_df):
    """Highlight anomalies on a time series chart."""
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=df[date_col].astype(str),
        y=df[value_col],
        mode="lines+markers",
        name="Normal",
        line=dict(color="royalblue")
    ))

    if not anomalies_df.empty:
        fig.add_trace(go.Scatter(
            x=anomalies_df[date_col].astype(str),
            y=anomalies_df[value_col],
            mode="markers",
            name="Anomaly",
            marker=dict(color="red", size=12, symbol="x")
        ))

    fig.update_layout(title="Anomaly Detection", height=400)
    return fig
