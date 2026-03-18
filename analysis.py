# ============================================================
# analysis.py — Data Processing & ML Analysis Module
# ============================================================

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder


# ─────────────────────────────────────────────
# 1. DATA LOADING
# ─────────────────────────────────────────────

def load_data(file):
    """
    Load data from uploaded file (CSV or Excel).
    Accepts a file path string OR a Streamlit UploadedFile object.
    """
    try:
        if hasattr(file, 'name'):
            # Streamlit uploaded file
            if file.name.endswith('.csv'):
                df = pd.read_csv(file, encoding="latin1")
            else:
                df = pd.read_excel(file)
        else:
            # File path string
            if str(file).endswith('.csv'):
                df = pd.read_csv(file, encoding="latin1")
            else:
                df = pd.read_excel(file)

        # Auto-detect date columns
        for col in df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    df[col] = pd.to_datetime(df[col])
                except Exception:
                    pass

        return df, None

    except Exception as e:
        return None, str(e)


# ─────────────────────────────────────────────
# 2. SMART COLUMN DETECTION
# ─────────────────────────────────────────────

def detect_columns(df):
    """
    Auto-detect which columns are sales, profit, date, category.
    Works for ANY industry dataset.
    """
    cols = {col.lower(): col for col in df.columns}
    result = {}

    # Sales column
    for key in ['sales', 'revenue', 'amount', 'total', 'income', 'turnover']:
        if key in cols:
            result['sales'] = cols[key]
            break

    # Profit column
    for key in ['profit', 'net profit', 'margin', 'earnings', 'net income']:
        if key in cols:
            result['profit'] = cols[key]
            break

    # Date column
    for key in ['order date', 'date', 'transaction date', 'invoice date', 'period']:
        if key in cols:
            result['date'] = cols[key]
            break
    # Also check datetime dtype columns
    if 'date' not in result:
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                result['date'] = col
                break

    # Category column
    for key in ['category', 'segment', 'type', 'department', 'product type', 'industry']:
        if key in cols:
            result['category'] = cols[key]
            break

    # Order/ID column
    for key in ['order id', 'transaction id', 'id', 'invoice id']:
        if key in cols:
            result['order_id'] = cols[key]
            break

    return result


# ─────────────────────────────────────────────
# 3. KPI COMPUTATION
# ─────────────────────────────────────────────

def compute_kpis(df, col_map):
    """Compute key performance indicators from dataframe."""
    kpis = {}

    if 'sales' in col_map:
        sales_col = col_map['sales']
        kpis['Total Sales'] = round(df[sales_col].sum(), 2)
        kpis['Average Sale'] = round(df[sales_col].mean(), 2)
        kpis['Max Sale'] = round(df[sales_col].max(), 2)

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
    else:
        kpis['Total Records'] = len(df)

    return kpis


# ─────────────────────────────────────────────
# 4. CATEGORY ANALYSIS
# ─────────────────────────────────────────────

def category_analysis(df, col_map):
    """Group by category and sum sales/profit."""
    if 'category' not in col_map:
        return None

    agg_cols = {}
    if 'sales' in col_map:
        agg_cols[col_map['sales']] = 'sum'
    if 'profit' in col_map:
        agg_cols[col_map['profit']] = 'sum'

    if not agg_cols:
        return None

    result = df.groupby(col_map['category']).agg(agg_cols).round(2)
    result = result.sort_values(list(agg_cols.keys())[0], ascending=False)
    return result


# ─────────────────────────────────────────────
# 5. MONTHLY TREND
# ─────────────────────────────────────────────

def monthly_sales(df, col_map):
    """Return monthly aggregated sales data."""
    if 'date' not in col_map or 'sales' not in col_map:
        return None

    date_col = col_map['date']
    sales_col = col_map['sales']

    monthly = df.groupby(df[date_col].dt.to_period("M"))[sales_col].sum()
    monthly = monthly.reset_index()
    monthly[date_col] = monthly[date_col].astype(str)
    monthly.columns = ['Month', 'Sales']
    return monthly


# ─────────────────────────────────────────────
# 6. FORECASTING
# ─────────────────────────────────────────────

def forecast_next_month(df, col_map):
    """Predict next month's sales using Linear Regression."""
    if 'date' not in col_map or 'sales' not in col_map:
        return None

    date_col = col_map['date']
    sales_col = col_map['sales']

    monthly = df.groupby(df[date_col].dt.to_period("M"))[sales_col].sum().reset_index()
    monthly['Month_Number'] = np.arange(len(monthly))

    if len(monthly) < 3:
        return None

    X = monthly[['Month_Number']]
    y = monthly[sales_col]

    model = LinearRegression()
    model.fit(X, y)

    next_month = pd.DataFrame([[len(monthly)]], columns=['Month_Number'])
    prediction = model.predict(next_month)

    return round(float(prediction[0]), 2)


# ─────────────────────────────────────────────
# 7. ANOMALY DETECTION
# ─────────────────────────────────────────────

def detect_anomalies(df, col_map):
    """Detect anomalous months using Isolation Forest."""
    if 'date' not in col_map or 'sales' not in col_map:
        return pd.DataFrame()

    date_col = col_map['date']
    sales_col = col_map['sales']

    monthly = df.groupby(df[date_col].dt.to_period("M"))[sales_col].sum().reset_index()
    monthly[date_col] = monthly[date_col].astype(str)
    monthly.columns = ['Month', 'Sales']

    if len(monthly) < 5:
        return pd.DataFrame(columns=['Month', 'Sales'])

    model = IsolationForest(contamination=0.1, random_state=42)
    monthly['Anomaly'] = model.fit_predict(monthly[['Sales']])
    anomalies = monthly[monthly['Anomaly'] == -1][['Month', 'Sales']]
    return anomalies


# ─────────────────────────────────────────────
# 8. PROFIT DIAGNOSTICS
# ─────────────────────────────────────────────

def profit_diagnostics(df, col_map):
    """Analyze profit performance by category."""
    if 'category' not in col_map or 'profit' not in col_map:
        return None

    cat_col = col_map['category']
    profit_col = col_map['profit']

    diag = df.groupby(cat_col)[profit_col].agg(['sum', 'mean', 'count']).round(2)
    diag.columns = ['Total Profit', 'Avg Profit', 'Count']
    diag = diag.sort_values('Total Profit', ascending=False)
    return diag


# ─────────────────────────────────────────────
# 9. FULL CONTEXT BUILDER FOR AI
# ─────────────────────────────────────────────

def build_ai_context(df, col_map, industry="General"):
    """Build a complete business context string for the AI."""
    context_parts = [f"Industry: {industry}\n"]

    kpis = compute_kpis(df, col_map)
    if kpis:
        context_parts.append("=== KEY PERFORMANCE INDICATORS ===")
        for k, v in kpis.items():
            if 'Margin' in k:
                context_parts.append(f"  {k}: {v:.1%}")
            elif isinstance(v, float):
                context_parts.append(f"  {k}: ${v:,.2f}")
            else:
                context_parts.append(f"  {k}: {v}")

    cat = category_analysis(df, col_map)
    if cat is not None:
        context_parts.append("\n=== CATEGORY PERFORMANCE ===")
        context_parts.append(cat.to_string())

    forecast = forecast_next_month(df, col_map)
    if forecast:
        context_parts.append(f"\n=== FORECAST ===\nPredicted Next Month Sales: ${forecast:,.2f}")

    anomalies = detect_anomalies(df, col_map)
    if not anomalies.empty:
        context_parts.append(f"\n=== ANOMALIES DETECTED ===\n{anomalies.to_string()}")
    else:
        context_parts.append("\n=== ANOMALIES ===\nNo anomalies detected.")

    diag = profit_diagnostics(df, col_map)
    if diag is not None:
        context_parts.append(f"\n=== PROFIT DIAGNOSTICS ===\n{diag.to_string()}")

    return "\n".join(context_parts)
