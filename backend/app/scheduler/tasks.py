# app/scheduler/tasks.py
# NEW FILE — Celery tasks for automated weekly and monthly reports
# Requires: Redis running + celery worker running (see README below)

import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# ── Celery app ────────────────────────────────────────────
celery_app = Celery(
    "logistics_scheduler",
    broker  = REDIS_URL,
    backend = REDIS_URL,
)

celery_app.conf.timezone = "UTC"

# ── Scheduled tasks (beat schedule) ──────────────────────
celery_app.conf.beat_schedule = {

    # Every Monday at 08:00 UTC — weekly report
    "weekly-report": {
        "task":     "app.scheduler.tasks.send_weekly_report",
        "schedule": crontab(hour=8, minute=0, day_of_week="monday"),
    },

    # 1st of every month at 08:00 UTC — monthly report
    "monthly-report": {
        "task":     "app.scheduler.tasks.send_monthly_report",
        "schedule": crontab(hour=8, minute=0, day_of_month="1"),
    },
}


# ── Task: weekly report ───────────────────────────────────
@celery_app.task(name="app.scheduler.tasks.send_weekly_report")
def send_weekly_report():
    """
    Generates the weekly logistics report and prints / emails it.
    Replace the print() call with an email sender (e.g. sendgrid, smtp)
    when you are ready to send real emails.
    """
    from app.database.connection import SessionLocal
    from app.analytics.engine import get_weekly_summary

    db = SessionLocal()
    try:
        summary = get_weekly_summary(db)
        # ── TODO: replace with real email send ────────────
        print("=" * 60)
        print("AUTOMATED WEEKLY REPORT")
        print(summary)
        print("=" * 60)
        # Example with sendgrid:
        # send_email(to="manager@company.com", subject="Weekly Report", body=summary)
        return {"status": "ok", "type": "weekly"}
    finally:
        db.close()


# ── Task: monthly report ──────────────────────────────────
@celery_app.task(name="app.scheduler.tasks.send_monthly_report")
def send_monthly_report():
    """
    Generates the monthly logistics report and prints / emails it.
    """
    from app.database.connection import SessionLocal
    from app.analytics.engine import get_monthly_summary

    db = SessionLocal()
    try:
        summary = get_monthly_summary(db)
        # ── TODO: replace with real email send ────────────
        print("=" * 60)
        print("AUTOMATED MONTHLY REPORT")
        print(summary)
        print("=" * 60)
        return {"status": "ok", "type": "monthly"}
    finally:
        db.close()


# ── Manual trigger endpoints (for testing) ────────────────
# Call these from admin panel to fire a report immediately without waiting for schedule

@celery_app.task(name="app.scheduler.tasks.trigger_weekly_now")
def trigger_weekly_now():
    return send_weekly_report()


@celery_app.task(name="app.scheduler.tasks.trigger_monthly_now")
def trigger_monthly_now():
    return send_monthly_report()