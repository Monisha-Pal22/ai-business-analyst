# models/analysis.py
# Core ML analysis: KPIs, forecasting, anomaly detection, diagnostics

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# ─── KPI ENGINE ──────────────────────────────────────────────────────────────

def compute_kpis(df, col_map):
    """Compute key performance indicators from any dataset."""
    kpis = {}

    if 'sales' in col_map:
        sales_col = col_map['sales']
        kpis['Total Sales'] = round(df[sales_col].sum(), 2)
        kpis['Average Sale'] = round(df[sales_col].mean(), 2)
        kpis['Max Sale'] = round(df[sales_col].max(), 2)
        kpis['Min Sale'] = round(df[sales_col].min(), 2)

    if 'profit' in col_map:
        profit_col = col_map['profit']
        kpis['Total Profit'] = round(df[profit_col].sum(), 2)
        kpis['Average Profit'] = round(df[profit_col].mean(), 2)

    if 'sales' in col_map and 'profit' in col_map:
        total_sales = df[col_map['sales']].sum()
        total_profit = df[col_map['profit']].sum()
        kpis['Profit Margin'] = round(total_profit / total_sales, 4) if total_sales != 0 else 0

    if 'order_id' in col_map:
        kpis['Total Orders'] = df[col_map['order_id']].nunique()

    if 'customer' in col_map:
        kpis['Total Customers'] = df[col_map['customer']].nunique()

    if 'region' in col_map:
        kpis['Total Regions'] = df[col_map['region']].nunique()

    return kpis


# ─── CATEGORY ANALYSIS ───────────────────────────────────────────────────────

def category_analysis(df, col_map):
    """Group by category and compute sales/profit."""
    if 'category' not in col_map:
        return pd.DataFrame()

    cat_col = col_map['category']
    agg = {}

    if 'sales' in col_map:
        agg[col_map['sales']] = 'sum'
    if 'profit' in col_map:
        agg[col_map['profit']] = 'sum'

    if not agg:
        return pd.DataFrame()

    result = df.groupby(cat_col).agg(agg).round(2)
    result = result.sort_values(list(agg.keys())[0], ascending=False)
    return result


# ─── REGION ANALYSIS ─────────────────────────────────────────────────────────

def region_analysis(df, col_map):
    """Group by region."""
    if 'region' not in col_map:
        return pd.DataFrame()

    region_col = col_map['region']
    agg = {}

    if 'sales' in col_map:
        agg[col_map['sales']] = 'sum'
    if 'profit' in col_map:
        agg[col_map['profit']] = 'sum'

    if not agg:
        return pd.DataFrame()

    return df.groupby(region_col).agg(agg).round(2).sort_values(
        list(agg.keys())[0], ascending=False
    )


# ─── MONTHLY TREND ───────────────────────────────────────────────────────────

def monthly_trend(df, col_map):
    """Monthly sales/profit trend."""
    if 'date' not in col_map or 'sales' not in col_map:
        return pd.DataFrame()

    date_col = col_map['date']
    sales_col = col_map['sales']

    monthly = df.groupby(df[date_col].dt.to_period("M"))[sales_col].sum()
    monthly = monthly.reset_index()
    monthly[date_col] = monthly[date_col].astype(str)
    return monthly


# ─── FORECASTING ─────────────────────────────────────────────────────────────

def forecast_next_months(df, col_map, periods=3):
    """Predict next N months of sales using Linear Regression."""
    if 'date' not in col_map or 'sales' not in col_map:
        return None, []

    date_col = col_map['date']
    sales_col = col_map['sales']

    monthly = df.groupby(df[date_col].dt.to_period("M"))[sales_col].sum().reset_index()
    monthly['Month_Number'] = np.arange(len(monthly))

    if len(monthly) < 3:
        return None, []

    X = monthly[['Month_Number']]
    y = monthly[sales_col]

    model = LinearRegression()
    model.fit(X, y)

    forecasts = []
    last_month = monthly['Month_Number'].max()
    for i in range(1, periods + 1):
        pred = model.predict(pd.DataFrame([[last_month + i]], columns=['Month_Number']))[0]
        forecasts.append(round(float(pred), 2))

    return model, forecasts


# ─── ANOMALY DETECTION ───────────────────────────────────────────────────────

def detect_anomalies(df, col_map):
    """Detect anomalous months using Isolation Forest."""
    if 'date' not in col_map or 'sales' not in col_map:
        return pd.DataFrame()

    date_col = col_map['date']
    sales_col = col_map['sales']

    monthly = df.groupby(df[date_col].dt.to_period("M"))[sales_col].sum().reset_index()
    monthly[sales_col] = monthly[sales_col].values

    if len(monthly) < 5:
        return pd.DataFrame()

    model = IsolationForest(contamination=0.1, random_state=42)
    monthly['Anomaly'] = model.fit_predict(monthly[[sales_col]])
    anomalies = monthly[monthly['Anomaly'] == -1].copy()
    anomalies[date_col] = anomalies[date_col].astype(str)
    return anomalies[[date_col, sales_col]]


# ─── PROFIT & LOSS DIAGNOSTICS ───────────────────────────────────────────────

def profit_loss_diagnostics(df, col_map):
    """Diagnose profit drivers and drainers."""
    diagnostics = {}

    if 'category' in col_map and 'profit' in col_map:
        cat_profit = df.groupby(col_map['category'])[col_map['profit']].sum()
        diagnostics['best_profit_category'] = cat_profit.idxmax()
        diagnostics['worst_profit_category'] = cat_profit.idxmin()
        diagnostics['loss_making_categories'] = list(cat_profit[cat_profit < 0].index)

    if 'region' in col_map and 'profit' in col_map:
        region_profit = df.groupby(col_map['region'])[col_map['profit']].sum()
        diagnostics['best_region'] = region_profit.idxmax()
        diagnostics['worst_region'] = region_profit.idxmin()

    if 'sales' in col_map and 'profit' in col_map:
        total_sales = df[col_map['sales']].sum()
        total_profit = df[col_map['profit']].sum()
        diagnostics['overall_margin_pct'] = round((total_profit / total_sales) * 100, 2) if total_sales else 0

    return diagnostics


# ─── TOP PRODUCTS / SEGMENTS ─────────────────────────────────────────────────

def top_performers(df, col_map, top_n=5):
    """Get top N performing products or categories."""
    result = {}

    if 'product' in col_map and 'sales' in col_map:
        top_products = (
            df.groupby(col_map['product'])[col_map['sales']]
            .sum()
            .sort_values(ascending=False)
            .head(top_n)
            .round(2)
        )
        result['top_products_by_sales'] = top_products

    if 'category' in col_map and 'sales' in col_map:
        top_cats = (
            df.groupby(col_map['category'])[col_map['sales']]
            .sum()
            .sort_values(ascending=False)
            .head(top_n)
            .round(2)
        )
        result['top_categories_by_sales'] = top_cats

    return result


# ─── GROWTH RATE ─────────────────────────────────────────────────────────────

def compute_growth_rate(df, col_map):
    """Month-over-month growth rate."""
    if 'date' not in col_map or 'sales' not in col_map:
        return None

    date_col = col_map['date']
    sales_col = col_map['sales']

    monthly = df.groupby(df[date_col].dt.to_period("M"))[sales_col].sum()

    if len(monthly) < 2:
        return None

    last = monthly.iloc[-1]
    prev = monthly.iloc[-2]
    growth = ((last - prev) / prev) * 100 if prev != 0 else 0
    return round(growth, 2)
