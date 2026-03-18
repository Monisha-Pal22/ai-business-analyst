# utils/data_ingestion.py
# Handles loading data from CSV, Excel, and SQL

import pandas as pd
import numpy as np
import os


def load_csv(file):
    """Load CSV file."""
    try:
        df = pd.read_csv(file, encoding="latin1")
        return df, None
    except Exception as e:
        return None, str(e)


def load_excel(file):
    """Load Excel file."""
    try:
        df = pd.read_excel(file)
        return df, None
    except Exception as e:
        return None, str(e)


def load_file(file):
    """Auto-detect file type and load."""
    name = file.name if hasattr(file, 'name') else str(file)
    if name.endswith('.csv'):
        return load_csv(file)
    elif name.endswith(('.xlsx', '.xls')):
        return load_excel(file)
    else:
        return None, "Unsupported file format. Please use CSV or Excel."


def detect_columns(df):
    """
    Auto-detect important columns in any dataset.
    Returns a dict with detected column roles.
    """
    cols = {c.lower(): c for c in df.columns}
    detected = {}

    # Date column
    for key in ['order date', 'date', 'transaction date', 'invoice date', 'sale date']:
        if key in cols:
            detected['date'] = cols[key]
            break

    # Sales / Revenue column
    for key in ['sales', 'revenue', 'amount', 'total', 'income', 'turnover']:
        if key in cols:
            detected['sales'] = cols[key]
            break

    # Profit column
    for key in ['profit', 'net profit', 'earnings', 'margin', 'net income']:
        if key in cols:
            detected['profit'] = cols[key]
            break

    # Category column
    for key in ['category', 'segment', 'type', 'product category', 'department']:
        if key in cols:
            detected['category'] = cols[key]
            break

    # Order ID
    for key in ['order id', 'transaction id', 'invoice id', 'id']:
        if key in cols:
            detected['order_id'] = cols[key]
            break

    # Region
    for key in ['region', 'area', 'location', 'zone', 'territory']:
        if key in cols:
            detected['region'] = cols[key]
            break

    # Customer
    for key in ['customer name', 'customer', 'client', 'buyer']:
        if key in cols:
            detected['customer'] = cols[key]
            break

    # Product
    for key in ['product name', 'product', 'item', 'sku', 'service']:
        if key in cols:
            detected['product'] = cols[key]
            break

    return detected


def prepare_dataframe(df, col_map):
    """Clean and prepare the dataframe using detected columns."""
    df = df.copy()

    # Parse date
    if 'date' in col_map:
        try:
            df[col_map['date']] = pd.to_datetime(df[col_map['date']], errors='coerce')
        except:
            pass

    # Clean numeric columns
    for role in ['sales', 'profit']:
        if role in col_map:
            col = col_map[role]
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    return df


def get_data_summary(df):
    """Return basic summary of the dataset."""
    summary = {
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": list(df.columns),
        "missing_values": int(df.isnull().sum().sum()),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()}
    }
    return summary
