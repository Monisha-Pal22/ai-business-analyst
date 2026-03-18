# scheduler/report_scheduler.py
# Automated weekly/monthly report scheduler

import schedule
import time
import threading
import json
import os
from datetime import datetime
from modules.ai_engine import generate_weekly_report
from database.db import save_report

# Store scheduled jobs state
_scheduler_running = False
_scheduler_thread  = None


def run_weekly_report(context: str, industry: str, username: str):
    """Generate and save a weekly report automatically."""
    print(f"[Scheduler] Running weekly report for {username} at {datetime.now()}")
    try:
        report = generate_weekly_report(context, industry)
        save_report(username, "Weekly Auto Report", industry, report)
        print(f"[Scheduler] Weekly report saved for {username}")
    except Exception as e:
        print(f"[Scheduler] Error: {e}")


def schedule_weekly(context: str, industry: str, username: str,
                    day: str = "monday", time_str: str = "08:00"):
    """
    Schedule a weekly report.
    day = 'monday' | 'tuesday' | ... | 'sunday'
    time_str = 'HH:MM'
    """
    job_func = lambda: run_weekly_report(context, industry, username)

    day_map = {
        "monday":    schedule.every().monday,
        "tuesday":   schedule.every().tuesday,
        "wednesday": schedule.every().wednesday,
        "thursday":  schedule.every().thursday,
        "friday":    schedule.every().friday,
        "saturday":  schedule.every().saturday,
        "sunday":    schedule.every().sunday,
    }

    scheduler = day_map.get(day.lower(), schedule.every().monday)
    scheduler.at(time_str).do(job_func)
    print(f"[Scheduler] Weekly report scheduled every {day} at {time_str}")


def schedule_monthly(context: str, industry: str, username: str):
    """Schedule a monthly report — runs on the 1st of every month."""
    def monthly_job():
        if datetime.now().day == 1:
            run_weekly_report(context, industry, username)

    schedule.every().day.at("09:00").do(monthly_job)
    print("[Scheduler] Monthly report scheduled for 1st of every month")


def start_scheduler():
    """Start the background scheduler thread."""
    global _scheduler_running, _scheduler_thread

    if _scheduler_running:
        return

    def run():
        global _scheduler_running
        _scheduler_running = True
        while _scheduler_running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    _scheduler_thread = threading.Thread(target=run, daemon=True)
    _scheduler_thread.start()
    print("[Scheduler] Background scheduler started")


def stop_scheduler():
    """Stop the background scheduler."""
    global _scheduler_running
    _scheduler_running = False
    schedule.clear()
    print("[Scheduler] Scheduler stopped")


def get_scheduled_jobs() -> list:
    """Return list of currently scheduled jobs."""
    return [str(job) for job in schedule.jobs]
