# modules/analysis.py
# Core analytics engine - KPIs, trends, forecasting, anomaly detection

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
from modules.data_loader import get_numeric_columns, get_date_columns


def compute_kpis(df, sales_col, profit_col=None, order_col=None):
    """Compute core business KPIs dynamically."""
    kpis = {}
    if sales_col and sales_col in df.columns:
        kpis["Total Revenue"]   = round(df[sales_col].sum(), 2)
        kpis["Avg Monthly Revenue"] = round(df[sales_col].mean(), 2)
        kpis["Max Single Value"] = round(df[sales_col].max(), 2)

    if profit_col and profit_col in df.columns:
        kpis["Total Profit"] = round(df[profit_col].sum(), 2)
        if sales_col in df.columns and df[sales_col].sum() != 0:
            kpis["Profit Margin"] = round(
                df[profit_col].sum() / df[sales_col].sum(), 4
            )

    if order_col and order_col in df.columns:
        kpis["Total Orders"] = df[order_col].nunique()

    return kpis


def category_breakdown(df, category_col, value_cols):
    """Group by category and sum value columns."""
    valid_cols = [c for c in value_cols if c in df.columns]
    if not valid_cols or category_col not in df.columns:
        return pd.DataFrame()
    return df.groupby(category_col)[valid_cols].sum().sort_values(valid_cols[0], ascending=False)


def time_series(df, date_col, value_col, freq="M"):
    """Build a monthly/quarterly time series."""
    if date_col not in df.columns or value_col not in df.columns:
        return pd.DataFrame()
    ts = df.groupby(df[date_col].dt.to_period(freq))[value_col].sum().reset_index()
    ts[date_col] = ts[date_col].astype(str)
    return ts


def forecast(df, date_col, value_col, periods=3):
    """
    Forecast next N periods using Linear Regression.
    Returns list of predicted values.
    """
    if date_col not in df.columns or value_col not in df.columns:
        return []
    monthly = df.groupby(df[date_col].dt.to_period("M"))[value_col].sum().reset_index()
    monthly["Month_Num"] = np.arange(len(monthly))

    if len(monthly) < 3:
        return []

    X = monthly[["Month_Num"]]
    y = monthly[value_col]
    model = LinearRegression()
    model.fit(X, y)

    future = pd.DataFrame(
        [[len(monthly) + i] for i in range(periods)],
        columns=["Month_Num"]
    )
    predictions = model.predict(future)
    return [round(float(p), 2) for p in predictions]


def detect_anomalies(df, date_col, value_col):
    """Detect anomalous periods using Isolation Forest."""
    if date_col not in df.columns or value_col not in df.columns:
        return pd.DataFrame()
    monthly = df.groupby(df[date_col].dt.to_period("M"))[value_col].sum().reset_index()
    if len(monthly) < 5:
        return pd.DataFrame()
    model = IsolationForest(contamination=0.1, random_state=42)
    monthly["Anomaly"] = model.fit_predict(monthly[[value_col]])
    return monthly[monthly["Anomaly"] == -1][[date_col, value_col]]


def profit_loss_diagnosis(df, sales_col, profit_col, date_col=None):
    """
    Diagnose profit and loss trends.
    Returns a text summary for the AI to use.
    """
    if sales_col not in df.columns or profit_col not in df.columns:
        return "Insufficient data for P&L diagnosis."

    total_sales  = df[sales_col].sum()
    total_profit = df[profit_col].sum()
    margin       = total_profit / total_sales if total_sales else 0
    loss_rows    = df[df[profit_col] < 0]

    summary = f"""
P&L Diagnosis:
- Total Revenue: {total_sales:,.2f}
- Total Profit: {total_profit:,.2f}
- Profit Margin: {margin:.1%}
- Loss-making records: {len(loss_rows)} out of {len(df)}
"""
    if date_col and date_col in df.columns:
        monthly = df.groupby(df[date_col].dt.to_period("M"))[profit_col].sum()
        worst   = monthly.idxmin()
        best    = monthly.idxmax()
        summary += f"- Best month: {best} (profit: {monthly[best]:,.2f})\n"
        summary += f"- Worst month: {worst} (profit: {monthly[worst]:,.2f})\n"

    return summary


def top_bottom_performers(df, category_col, value_col, n=3):
    """Return top N and bottom N performers."""
    if category_col not in df.columns or value_col not in df.columns:
        return pd.DataFrame(), pd.DataFrame()
    grouped = df.groupby(category_col)[value_col].sum().sort_values(ascending=False)
    return grouped.head(n), grouped.tail(n)
