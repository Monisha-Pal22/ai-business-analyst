# # main.py
# # Entry point — starts the FastAPI server and connects all routes

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.database.connection import engine, Base
# from app.api import chat, services, meetings, admin
# from app.analytics.engine import router as analytics_router

# # Create all database tables automatically on startup
# Base.metadata.create_all(bind=engine)

# # Initialize FastAPI app
# app = FastAPI(
#     title="AI Business Assistant API",
#     description="Logistics Intelligence Platform Backend",
#     version="1.0.0"
# )

# # ── CORS — allows React frontend to talk to this backend ──
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ── Register all routes ───────────────────────────────────
# app.include_router(chat.router,          prefix="/api/chat",      tags=["Chat"])
# app.include_router(services.router,      prefix="/api/services",  tags=["Services"])
# app.include_router(meetings.router,      prefix="/api/meetings",  tags=["Meetings"])
# app.include_router(admin.router,         prefix="/api/admin",     tags=["Admin"])
# app.include_router(analytics_router,     prefix="/api/analytics", tags=["Analytics"])


# # ── Health check ──────────────────────────────────────────
# @app.get("/")
# def root():
#     return {
#         "status":  "running",
#         "message": "AI Business Assistant API is live",
#         "docs":    "Visit /docs for API documentation"
#     }



# main.py
# UPGRADED — registered /api/client route for client registration

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from app.api import chat, services, meetings, admin
from app.api import clients                          # NEW
from app.analytics.engine import router as analytics_router
from app.scheduler import tasks
# from datetime import datetime, timezone
# from sqlalchemy import func

# Create all database tables automatically on startup (including new AuditLog, RouteMetric)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title       = "AI Business Assistant API",
    description = "Logistics Intelligence Platform Backend",
    version     = "2.0.0"
)

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins      = ["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials  = True,
    allow_methods      = ["*"],
    allow_headers      = ["*"],
)

# ── Routes ────────────────────────────────────────────────
app.include_router(chat.router,           prefix="/api/chat",      tags=["Chat"])
app.include_router(services.router,       prefix="/api/services",  tags=["Services"])
app.include_router(meetings.router,       prefix="/api/meetings",  tags=["Meetings"])
app.include_router(admin.router,          prefix="/api/admin",     tags=["Admin"])
app.include_router(analytics_router,      prefix="/api/analytics", tags=["Analytics"])
app.include_router(clients.router,        prefix="/api/client",    tags=["Client"])   # NEW


# ── Health check ──────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status":  "running",
        "version": "2.0.0",
        "message": "AI Business Assistant API is live",
        "docs":    "Visit /docs for API documentation"
    }