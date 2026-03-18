# app/api/meetings.py
# Handles meeting scheduling from clients

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Meeting
from datetime import datetime
from typing import Optional

router = APIRouter()


class MeetingRequest(BaseModel):
    client_name:  str
    client_email: str
    datetime_str: str        # format: "2025-06-20 14:00"
    notes:        Optional[str] = None


class MeetingOut(BaseModel):
    id:           int
    client_name:  str
    client_email: str
    datetime:     datetime
    status:       str
    meeting_link: Optional[str]

    class Config:
        from_attributes = True


@router.post("/schedule", response_model=MeetingOut)
def schedule_meeting(request: MeetingRequest, db: Session = Depends(get_db)):
    """Client books a meeting."""
    try:
        dt = datetime.strptime(request.datetime_str, "%Y-%m-%d %H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="Date format must be: YYYY-MM-DD HH:MM")

    meeting = Meeting(
        client_name  = request.client_name,
        client_email = request.client_email,
        datetime     = dt,
        notes        = request.notes,
        status       = "scheduled",
        meeting_link = f"https://meet.example.com/{request.client_name.replace(' ','-').lower()}"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/all")
def get_all_meetings(db: Session = Depends(get_db)):
    """Admin — get all scheduled meetings."""
    meetings = db.query(Meeting).order_by(Meeting.datetime).all()
    return meetings


@router.put("/{meeting_id}/status")
def update_status(meeting_id: int, status: str, db: Session = Depends(get_db)):
    """Admin — update meeting status."""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = status
    db.commit()
    return {"message": f"Meeting {meeting_id} updated to {status}"}
