# connectors/multi_source.py
# Handles multiple data source uploads and merging

import pandas as pd
import sqlite3
from modules.data_loader import load_csv, load_excel, normalize


def load_multiple_files(files: list) -> pd.DataFrame:
    """
    Load multiple CSV/Excel files and merge them into one DataFrame.
    Useful for combining monthly reports, multi-branch data etc.
    """
    dfs = []
    for f in files:
        name = f.name.lower()
        try:
            if name.endswith(".csv"):
                df = load_csv(f)
            elif name.endswith((".xlsx", ".xls")):
                df = load_excel(f)
            else:
                continue
            df["_source_file"] = f.name
            dfs.append(df)
        except Exception as e:
            print(f"Skipping {f.name}: {e}")

    if not dfs:
        return pd.DataFrame()

    # Try to combine — align columns
    combined = pd.concat(dfs, ignore_index=True, sort=False)
    return normalize(combined)


def load_from_sqlite(db_path: str, table_name: str) -> pd.DataFrame:
    """Load a table from any SQLite database file."""
    try:
        conn = sqlite3.connect(db_path)
        df = pd.read_sql(f"SELECT * FROM {table_name}", conn)
        conn.close()
        return normalize(df)
    except Exception as e:
        raise ValueError(f"SQLite error: {e}")


def list_sqlite_tables(db_path: str) -> list:
    """List all tables in a SQLite database."""
    try:
        conn = sqlite3.connect(db_path)
        tables = pd.read_sql(
            "SELECT name FROM sqlite_master WHERE type='table'", conn
        )["name"].tolist()
        conn.close()
        return tables
    except Exception as e:
        return []


def merge_on_date(df1: pd.DataFrame, df2: pd.DataFrame,
                  date_col1: str, date_col2: str) -> pd.DataFrame:
    """Merge two dataframes on their date columns."""
    try:
        df1[date_col1] = pd.to_datetime(df1[date_col1])
        df2[date_col2] = pd.to_datetime(df2[date_col2])
        merged = pd.merge(df1, df2,
                          left_on=date_col1, right_on=date_col2,
                          how="outer", suffixes=("_file1", "_file2"))
        return merged
    except Exception as e:
        raise ValueError(f"Merge error: {e}")
