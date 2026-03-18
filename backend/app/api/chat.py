# app/api/chat.py
# Client chatbot API — handles incoming messages from website visitors

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import ChatLog
from app.chatbot.engine import get_ai_response
import uuid

router = APIRouter()


class ChatRequest(BaseModel):
    message:    str
    session_id: str = None   # anonymous users get a session ID


class ChatResponse(BaseModel):
    reply:      str
    session_id: str


@router.post("/message", response_model=ChatResponse)
def send_message(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Client sends a message → AI replies → saved to database.
    """
    # Generate session ID if not provided (new visitor)
    session_id = request.session_id or str(uuid.uuid4())

    # Get AI response
    reply = get_ai_response(request.message, chat_type="client")

    # Save to database
    log = ChatLog(
        session_id = session_id,
        message    = request.message,
        response   = reply,
        chat_type  = "client"
    )
    db.add(log)
    db.commit()

    return ChatResponse(reply=reply, session_id=session_id)


@router.get("/history/{session_id}")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Get previous chat messages for a session."""
    logs = db.query(ChatLog).filter(
        ChatLog.session_id == session_id
    ).order_by(ChatLog.timestamp).all()

    return [{"message": l.message, "response": l.response, "time": l.timestamp} for l in logs]
