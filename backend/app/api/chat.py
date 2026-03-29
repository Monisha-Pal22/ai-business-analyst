# # # app/api/chat.py
# # # Client chatbot API — handles incoming messages from website visitors

# # from fastapi import APIRouter, Depends
# # from pydantic import BaseModel
# # from sqlalchemy.orm import Session
# # from app.database.connection import get_db
# # from app.database.models import ChatLog
# # from app.chatbot.engine import get_ai_response
# # import uuid

# # router = APIRouter()


# # class ChatRequest(BaseModel):
# #     message:    str
# #     session_id: str = None   # anonymous users get a session ID


# # class ChatResponse(BaseModel):
# #     reply:      str
# #     session_id: str


# # @router.post("/message", response_model=ChatResponse)
# # def send_message(request: ChatRequest, db: Session = Depends(get_db)):
# #     """
# #     Client sends a message → AI replies → saved to database.
# #     """
# #     # Generate session ID if not provided (new visitor)
# #     session_id = request.session_id or str(uuid.uuid4())

# #     # Get AI response
# #     reply = get_ai_response(request.message, chat_type="client")

# #     # Save to database
# #     log = ChatLog(
# #         session_id = session_id,
# #         message    = request.message,
# #         response   = reply,
# #         chat_type  = "client"
# #     )
# #     db.add(log)
# #     db.commit()

# #     return ChatResponse(reply=reply, session_id=session_id)


# # @router.get("/history/{session_id}")
# # def get_chat_history(session_id: str, db: Session = Depends(get_db)):
# #     """Get previous chat messages for a session."""
# #     logs = db.query(ChatLog).filter(
# #         ChatLog.session_id == session_id
# #     ).order_by(ChatLog.timestamp).all()

# #     return [{"message": l.message, "response": l.response, "time": l.timestamp} for l in logs]



# # app/api/chat.py
# import uuid
# import re
# from fastapi import APIRouter, Depends
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from app.database.connection import get_db
# from app.database.models import ChatLog, User
# from app.chatbot.engine import get_ai_response
# from typing import Optional

# router = APIRouter()


# class ChatRequest(BaseModel):
#     message:    str
#     session_id: Optional[str] = None


# class ChatResponse(BaseModel):
#     reply:      str
#     session_id: str


# def extract_user_data(text: str) -> dict:
#     """Extract user data tags from AI response."""
#     data = {}
#     match = re.search(r'\[USER_DATA:([^\]]+)\]', text)
#     if match:
#         parts = match.group(1).split(',')
#         for part in parts:
#             if '=' in part:
#                 key, val = part.split('=', 1)
#                 data[key.strip()] = val.strip()
#     return data


# def extract_booking(text: str) -> dict:
#     """Extract booking data from AI response."""
#     match = re.search(r'\[BOOK_MEETING:([^:]+):([^:]+):([^\]]+)\]', text)
#     if match:
#         return {
#             'name':     match.group(1),
#             'email':    match.group(2),
#             'datetime': match.group(3)
#         }
#     return {}


# def clean_reply(text: str) -> str:
#     """Remove data tags from user-visible reply."""
#     text = re.sub(r'\[USER_DATA:[^\]]+\]', '', text)
#     text = re.sub(r'\[BOOK_MEETING:[^\]]+\]', '', text)
#     return text.strip()


# def save_user_data(db: Session, session_id: str, data: dict):
#     """Save extracted user data to database."""
#     if not data:
#         return
#     existing = db.query(User).filter(User.email == data.get('email')).first()
#     if not existing and data.get('email'):
#         user = User(
#             name         = data.get('name', 'Unknown'),
#             email        = data.get('email'),
#             company      = data.get('company', ''),
#             password     = 'chat_user',
#             requirements = f"Collected via chat session {session_id}"
#         )
#         db.add(user)
#         db.commit()


# def auto_book_meeting(db: Session, booking: dict):
#     """Auto book meeting from chat conversation."""
#     if not booking:
#         return
#     from app.database.models import Meeting
#     from datetime import datetime
#     try:
#         dt = datetime.strptime(booking['datetime'].strip(), "%Y-%m-%d %H:%M")
#     except Exception:
#         dt = datetime.utcnow()

#     meeting = Meeting(
#         client_name  = booking['name'],
#         client_email = booking['email'],
#         datetime     = dt,
#         status       = "scheduled",
#         meeting_link = f"https://meet.example.com/{booking['name'].replace(' ','-').lower()}",
#         notes        = "Booked via AI chat conversation"
#     )
#     db.add(meeting)
#     db.commit()


# @router.post("/message", response_model=ChatResponse)
# def send_message(request: ChatRequest, db: Session = Depends(get_db)):
#     session_id = request.session_id or str(uuid.uuid4())
#     raw_reply  = get_ai_response(request.message, chat_type="client")

#     # Extract and save user data silently
#     user_data = extract_user_data(raw_reply)
#     if user_data:
#         save_user_data(db, session_id, user_data)

#     # Extract and save booking silently
#     booking = extract_booking(raw_reply)
#     if booking:
#         auto_book_meeting(db, booking)

#     # Clean reply before sending to user
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


# import uuid
# import re
# from fastapi import APIRouter, Depends
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from app.database.connection import get_db
# from app.database.models import ChatLog, User
# from app.chatbot.engine import get_ai_response
# from typing import Optional

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
#     match = re.search(r'\[BOOK_MEETING:([^:]+):([^:]+):([^\]]+)\]', text)
#     if match:
#         return {
#             'name':     match.group(1).strip(),
#             'email':    match.group(2).strip(),
#             'datetime': match.group(3).strip()
#         }
#     return {}


# def clean_reply(text: str) -> str:
#     text = re.sub(r'\[USER_DATA:[^\]]+\]', '', text)
#     text = re.sub(r'\[BOOK_MEETING:[^\]]+\]', '', text)
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
#     from app.database.models import Meeting
#     from datetime import datetime
#     try:
#         dt = datetime.strptime(booking['datetime'], "%Y-%m-%d %H:%M")
#     except Exception:
#         dt = datetime.utcnow()
#     meeting = Meeting(
#         client_name  = booking['name'],
#         client_email = booking['email'],
#         datetime     = dt,
#         status       = "scheduled",
#         meeting_link = f"https://meet.example.com/{booking['name'].replace(' ', '-').lower()}",
#         notes        = "Booked via AI chat conversation"
#     )
#     db.add(meeting)
#     db.commit()


# @router.post("/message", response_model=ChatResponse)
# def send_message(request: ChatRequest, db: Session = Depends(get_db)):
#     session_id = request.session_id or str(uuid.uuid4())
#     raw_reply  = get_ai_response(request.message, chat_type="client")
#     user_data  = extract_user_data(raw_reply)
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
#     match = re.search(r'\[BOOK_MEETING:([^:]+):([^:]+):([^\]]+)\]', text)
#     if match:
#         name = match.group(1).strip()
#         email = match.group(2).strip()
#         datetime_str = match.group(3).strip()
#         # Clean any leftover tags from name
#         name = re.sub(r'\[.*?\]', '', name).strip()
#         return {'name': name, 'email': email, 'datetime': datetime_str}
#     return {}

# # def extract_booking(text: str) -> dict:
# #     match = re.search(r'\[BOOK_MEETING:([^:]+):([^:]+):([^\]]+)\]', text)
# #     if match:
# #         return {
# #             'name':     match.group(1).strip(),
# #             'email':    match.group(2).strip(),
# #             'datetime': match.group(3).strip()
# #         }
# #     return {}


# def clean_reply(text: str) -> str:
#     text = re.sub(r'\[USER_DATA:[^\]]+\]', '', text)
#     text = re.sub(r'\[BOOK_MEETING:[^\]]+\]', '', text)
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
#         dt = datetime.strptime(booking['datetime'], "%Y-%m-%d %H:%M")
#     except Exception:
#         dt = datetime.utcnow()
#     meeting = Meeting(
#         client_name  = booking['name'],
#         client_email = booking['email'],
#         datetime     = dt,
#         status       = "scheduled",
#         meeting_link = f"https://meet.example.com/{booking['name'].replace(' ', '-').lower()}",
#         notes        = "Booked via AI chat conversation"
#     )
#     db.add(meeting)
#     db.commit()


# @router.post("/message", response_model=ChatResponse)
# def send_message(request: ChatRequest, db: Session = Depends(get_db)):
#     session_id = request.session_id or str(uuid.uuid4())
#     raw_reply  = get_ai_response(request.message, chat_type="client")
#     user_data  = extract_user_data(raw_reply)
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
    message:    str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply:      str
    session_id: str


def extract_user_data(text: str) -> dict:
    data = {}
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
        dt_str = match.group(3).strip()
        if name and email and dt_str:
            return {'name': name, 'email': email, 'datetime': dt_str}
    return {}


def clean_reply(text: str) -> str:
    text = re.sub(r'\[USER_DATA:[^\]]+\]', '', text)
    text = re.sub(r'\[BOOK_MEETING:[^\]]+\]', '', text)
    text = re.sub(r'\[SERVICES_CARD\]', '', text)
    return text.strip()


def save_user_data(db: Session, session_id: str, data: dict):
    if not data or not data.get('email'):
        return
    existing = db.query(User).filter(User.email == data.get('email')).first()
    if not existing:
        user = User(
            name         = data.get('name', 'Chat User'),
            email        = data.get('email'),
            company      = data.get('company', ''),
            password     = 'chat_collected',
            requirements = f"Collected via chat session {session_id}"
        )
        db.add(user)
        db.commit()


def auto_book_meeting(db: Session, booking: dict):
    if not booking:
        return
    try:
        dt_str = booking['datetime'].replace(' ', ' ').strip()
        try:
            dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        except ValueError:
            try:
                dt = datetime.strptime(dt_str, "%Y-%m-%d")
            except ValueError:
                dt = datetime.utcnow()
        
        meeting = Meeting(
            client_name  = booking['name'],
            client_email = booking['email'],
            datetime     = dt,
            status       = "scheduled",
            meeting_link = f"https://meet.example.com/{booking['name'].replace(' ', '-').lower()}",
            notes        = "Booked via AI chat conversation"
        )
        db.add(meeting)
        db.commit()
    except Exception as e:
        print(f"Meeting booking error: {e}")


@router.post("/message", response_model=ChatResponse)
def send_message(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or str(uuid.uuid4())
    raw_reply  = get_ai_response(request.message, chat_type="client")
    
    user_data = extract_user_data(raw_reply)
    if user_data:
        save_user_data(db, session_id, user_data)
    
    booking = extract_booking(raw_reply)
    if booking:
        auto_book_meeting(db, booking)
    
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