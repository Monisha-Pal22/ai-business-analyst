# # app/api/chat.py
# import uuid
# import re
# from fastapi import APIRouter, Depends
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from app.database.connection import get_db
# from app.database.models import ChatLog, User, Meeting
# from app.chatbot.engine import get_ai_response
# from typing import Optional
# from datetime import datetime

# router = APIRouter()


# class ChatRequest(BaseModel):
#     message:    str
#     session_id: Optional[str] = None


# class ChatResponse(BaseModel):
#     reply:      str
#     session_id: str


# def extract_user_data(text: str) -> dict:
#     data = {}
#     match = re.search(r'\[USER_DATA:([^\]]+)\]', text)
#     if match:
#         for part in match.group(1).split(','):
#             if '=' in part:
#                 key, val = part.split('=', 1)
#                 data[key.strip()] = val.strip()
#     return data


# def extract_booking(text: str) -> dict:
#     match = re.search(r'\[BOOK_MEETING:([^:\]]+):([^:\]]+):([^\]]+)\]', text)
#     if match:
#         name = re.sub(r'\[.*?\]', '', match.group(1)).strip()
#         email = match.group(2).strip()
#         dt_str = match.group(3).strip()
#         if name and email and dt_str:
#             return {'name': name, 'email': email, 'datetime': dt_str}
#     return {}


# def clean_reply(text: str) -> str:
#     text = re.sub(r'\[USER_DATA:[^\]]+\]', '', text)
#     text = re.sub(r'\[BOOK_MEETING:[^\]]+\]', '', text)
#     text = re.sub(r'\[SERVICES_CARD\]', '', text)
#     return text.strip()


# def save_user_data(db: Session, session_id: str, data: dict):
#     if not data or not data.get('email'):
#         return
#     existing = db.query(User).filter(User.email == data.get('email')).first()
#     if not existing:
#         user = User(
#             name         = data.get('name', 'Chat User'),
#             email        = data.get('email'),
#             company      = data.get('company', ''),
#             password     = 'chat_collected',
#             requirements = f"Collected via chat session {session_id}"
#         )
#         db.add(user)
#         db.commit()


# def auto_book_meeting(db: Session, booking: dict):
#     if not booking:
#         return
#     try:
#         dt_str = booking['datetime'].replace(' ', ' ').strip()
#         try:
#             dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
#         except ValueError:
#             try:
#                 dt = datetime.strptime(dt_str, "%Y-%m-%d")
#             except ValueError:
#                 dt = datetime.utcnow()
        
#         meeting = Meeting(
#             client_name  = booking['name'],
#             client_email = booking['email'],
#             datetime     = dt,
#             status       = "scheduled",
#             meeting_link = f"https://meet.example.com/{booking['name'].replace(' ', '-').lower()}",
#             notes        = "Booked via AI chat conversation"
#         )
#         db.add(meeting)
#         db.commit()
#     except Exception as e:
#         print(f"Meeting booking error: {e}")


# @router.post("/message", response_model=ChatResponse)
# def send_message(request: ChatRequest, db: Session = Depends(get_db)):
#     session_id = request.session_id or str(uuid.uuid4())
#     raw_reply  = get_ai_response(request.message, chat_type="client")
    
#     user_data = extract_user_data(raw_reply)
#     if user_data:
#         save_user_data(db, session_id, user_data)
    
#     booking = extract_booking(raw_reply)
#     if booking:
#         auto_book_meeting(db, booking)
    
#     clean = clean_reply(raw_reply)
    
#     log = ChatLog(
#         session_id = session_id,
#         message    = request.message,
#         response   = clean,
#         chat_type  = "client"
#     )
#     db.add(log)
#     db.commit()
    
#     return ChatResponse(reply=clean, session_id=session_id)


# @router.get("/history/{session_id}")
# def get_chat_history(session_id: str, db: Session = Depends(get_db)):
#     logs = db.query(ChatLog).filter(
#         ChatLog.session_id == session_id
#     ).order_by(ChatLog.timestamp).all()
#     return [{"message": l.message, "response": l.response, "time": l.timestamp} for l in logs]




# app/api/chat.py
import uuid
import re
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import ChatLog, User, Meeting
from app.chatbot.engine import get_ai_response
from typing import Optional
from datetime import datetime

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    history: Optional[list] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str

def extract_lead_data(text: str) -> dict:
    data = {}
    match = re.search(r'\[LEAD_DATA:([^\]]+)\]', text)
    if not match:
        match = re.search(r'\[USER_DATA:([^\]]+)\]', text)
    if match:
        for part in match.group(1).split(','):
            if '=' in part:
                key, val = part.split('=', 1)
                data[key.strip()] = val.strip()
    return data

def extract_booking(text: str) -> dict:
    match = re.search(r'\[BOOK_MEETING:([^:\]]+):([^:\]]+):([^\]]+)\]', text)
    if match:
        name = re.sub(r'\[.*?\]', '', match.group(1)).strip()
        email = match.group(2).strip()
        dt_str = re.sub(r'\[.*?\]', '', match.group(3)).strip()
        if name and email and dt_str:
            return {'name': name, 'email': email, 'datetime': dt_str}
    return {}

def clean_reply(text: str) -> str:
    text = re.sub(r'\[LEAD_DATA:[^\]]+\]', '', text)
    text = re.sub(r'\[USER_DATA:[^\]]+\]', '', text)
    text = re.sub(r'\[BOOK_MEETING:[^\]]+\]', '', text)
    text = re.sub(r'\[SERVICES_CARD\]', '', text)
    return text.strip()

def save_lead(db: Session, session_id: str, data: dict):
    if not data or not data.get('email'):
        return
    existing = db.query(User).filter(User.email == data.get('email')).first()
    if not existing:
        user = User(
            name         = data.get('name', 'Lead'),
            email        = data.get('email'),
            phone        = data.get('phone', ''),
            company      = data.get('company', ''),
            password     = 'lead_collected',
            requirements = data.get('requirement', f"Session {session_id}")
        )
        db.add(user)
        db.commit()

def auto_book(db: Session, booking: dict):
    if not booking:
        return
    try:
        dt_str = booking['datetime'].strip()
        for fmt in ["%Y-%m-%d %H:%M", "%Y-%m-%d"]:
            try:
                dt = datetime.strptime(dt_str, fmt)
                break
            except ValueError:
                dt = datetime.utcnow()
        meeting = Meeting(
            client_name  = booking['name'],
            client_email = booking['email'],
            datetime     = dt,
            status       = "scheduled",
            meeting_link = f"https://meet.logiai.com/{booking['name'].lower().replace(' ','-')}",
            notes        = "Booked via AI chat"
        )
        db.add(meeting)
        db.commit()
    except Exception as e:
        print(f"Booking error: {e}")

@router.post("/message", response_model=ChatResponse)
def send_message(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or str(uuid.uuid4())
    
    # Build history from request
    history = request.history or []
    
    raw_reply = get_ai_response(request.message, chat_type="client", history=history)
    
    lead_data = extract_lead_data(raw_reply)
    if lead_data:
        save_lead(db, session_id, lead_data)
    
    booking = extract_booking(raw_reply)
    if booking:
        auto_book(db, booking)
    
    clean = clean_reply(raw_reply)
    
    log = ChatLog(
        session_id = session_id,
        message    = request.message,
        response   = clean,
        chat_type  = "client"
    )
    db.add(log)
    db.commit()
    
    return ChatResponse(reply=clean, session_id=session_id)

@router.get("/history/{session_id}")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    logs = db.query(ChatLog).filter(
        ChatLog.session_id == session_id
    ).order_by(ChatLog.timestamp).all()
    return [{"message": l.message, "response": l.response, "time": l.timestamp} for l in logs]