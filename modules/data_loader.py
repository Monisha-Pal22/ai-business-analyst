# modules/data_loader.py
import pandas as pd
import numpy as np
import sqlite3

def load_csv(file):
    try:
        df = pd.read_csv(file, encoding="latin1")
        return normalize(df)
    except Exception as e:
        raise ValueError(f"CSV load error: {e}")

def load_excel(file):
    try:
        df = pd.read_excel(file)
        return normalize(df)
    except Exception as e:
        raise ValueError(f"Excel load error: {e}")

def load_sql(db_path, query):
    try:
        conn = sqlite3.connect(db_path)
        df = pd.read_sql_query(query, conn)
        conn.close()
        return normalize(df)
    except Exception as e:
        raise ValueError(f"SQL load error: {e}")

def normalize(df):
    df.columns = [c.strip() for c in df.columns]
    for col in df.columns:
        if "date" in col.lower() or "time" in col.lower():
            try:
                df[col] = pd.to_datetime(df[col], errors="coerce")
            except:
                pass
    df.dropna(axis=1, how="all", inplace=True)
    return df

def get_numeric_columns(df):
    return df.select_dtypes(include=[np.number]).columns.tolist()

def get_date_columns(df):
    return df.select_dtypes(include=["datetime64"]).columns.tolist()

def get_categorical_columns(df):
    return df.select_dtypes(include=["object", "category"]).columns.tolist()

def summarize_dataframe(df):
    return {
        "rows": len(df),
        "columns": len(df.columns),
        "numeric_cols": get_numeric_columns(df),
        "date_cols": get_date_columns(df),
        "categorical_cols": get_categorical_columns(df),
        "missing_values": int(df.isnull().sum().sum()),
    }
