# auth/auth.py
# Simple login system with role-based access control

import streamlit as st
import hashlib
import json
import os

# ── User Database (in real project, use a real DB) ────────
# Passwords are stored as SHA256 hashes
USERS = {
    "admin": {
        "password": hashlib.sha256("admin123".encode()).hexdigest(),
        "role": "admin",
        "name": "Admin User",
    },
    "ceo": {
        "password": hashlib.sha256("ceo123".encode()).hexdigest(),
        "role": "executive",
        "name": "CEO",
    },
    "analyst": {
        "password": hashlib.sha256("analyst123".encode()).hexdigest(),
        "role": "analyst",
        "name": "Business Analyst",
    },
    "viewer": {
        "password": hashlib.sha256("viewer123".encode()).hexdigest(),
        "role": "viewer",
        "name": "Report Viewer",
    },
}

# ── Role Permissions ──────────────────────────────────────
ROLE_PERMISSIONS = {
    "admin":     ["dashboard", "chat", "reports", "upload", "settings"],
    "executive": ["dashboard", "chat", "reports"],
    "analyst":   ["dashboard", "chat", "reports", "upload"],
    "viewer":    ["dashboard", "reports"],
}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_login(username: str, password: str) -> dict | None:
    """Check username and password. Return user info or None."""
    user = USERS.get(username.lower())
    if user and user["password"] == hash_password(password):
        return {
            "username": username,
            "name":     user["name"],
            "role":     user["role"],
        }
    return None


def has_permission(role: str, feature: str) -> bool:
    """Check if a role has access to a feature."""
    return feature in ROLE_PERMISSIONS.get(role, [])


def show_login_page():
    """Render the login UI. Returns True if logged in."""
    st.markdown("""
    <style>
    .login-box {
        max-width: 400px;
        margin: 80px auto;
        padding: 30px;
        border-radius: 12px;
        background: #f8f9fa;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    </style>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("## 🤖 AI Business Analyst")
        st.markdown("### 🔐 Login")
        st.divider()

        username = st.text_input("👤 Username", placeholder="Enter username")
        password = st.text_input("🔑 Password", type="password", placeholder="Enter password")

        if st.button("Login", type="primary", use_container_width=True):
            user = verify_login(username, password)
            if user:
                st.session_state.logged_in = True
                st.session_state.user = user
                st.success(f"Welcome, {user['name']}!")
                st.rerun()
            else:
                st.error("❌ Wrong username or password")

        st.divider()
        st.markdown("**Demo Accounts:**")
        st.markdown("""
        | Username | Password | Role |
        |---|---|---|
        | admin | admin123 | Full Access |
        | ceo | ceo123 | Executive |
        | analyst | analyst123 | Analyst |
        | viewer | viewer123 | View Only |
        """)


def logout():
    """Clear session and log out."""
    for key in ["logged_in", "user"]:
        if key in st.session_state:
            del st.session_state[key]
    st.rerun()


def require_login():
    """
    Call this at the top of app.py.
    If not logged in, shows login page and stops execution.
    """
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False

    if not st.session_state.logged_in:
        show_login_page()
        st.stop()
