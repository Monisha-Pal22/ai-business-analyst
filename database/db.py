# database/db.py
# SQLite database for storing chat history, reports, uploaded file metadata

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = "database/business_analyst.db"


def get_connection():
    os.makedirs("database", exist_ok=True)
    return sqlite3.connect(DB_PATH, check_same_thread=False)


def init_db():
    """Create all tables if they don't exist."""
    conn = get_connection()
    c = conn.cursor()

    # Chat history table
    c.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            username  TEXT,
            industry  TEXT,
            role      TEXT,
            message   TEXT,
            timestamp TEXT
        )
    """)

    # Reports table
    c.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT,
            report_type TEXT,
            industry    TEXT,
            content     TEXT,
            timestamp   TEXT
        )
    """)

    # Upload log table
    c.execute("""
        CREATE TABLE IF NOT EXISTS upload_log (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            username  TEXT,
            filename  TEXT,
            rows      INTEGER,
            columns   INTEGER,
            industry  TEXT,
            timestamp TEXT
        )
    """)

    conn.commit()
    conn.close()


def save_chat_message(username, industry, role, message):
    conn = get_connection()
    conn.execute(
        "INSERT INTO chat_history (username, industry, role, message, timestamp) VALUES (?,?,?,?,?)",
        (username, industry, role, message, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()


def get_chat_history(username, limit=50):
    conn = get_connection()
    rows = conn.execute(
        "SELECT role, message, timestamp FROM chat_history WHERE username=? ORDER BY id DESC LIMIT ?",
        (username, limit)
    ).fetchall()
    conn.close()
    return rows


def save_report(username, report_type, industry, content):
    conn = get_connection()
    conn.execute(
        "INSERT INTO reports (username, report_type, industry, content, timestamp) VALUES (?,?,?,?,?)",
        (username, report_type, industry, content, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()


def get_reports(username):
    conn = get_connection()
    rows = conn.execute(
        "SELECT report_type, industry, content, timestamp FROM reports WHERE username=? ORDER BY id DESC",
        (username,)
    ).fetchall()
    conn.close()
    return rows


def log_upload(username, filename, rows, columns, industry):
    conn = get_connection()
    conn.execute(
        "INSERT INTO upload_log (username, filename, rows, columns, industry, timestamp) VALUES (?,?,?,?,?,?)",
        (username, filename, rows, columns, industry, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
