# app/api/clients.py
# NEW FILE — handles client self-registration
# Requirement: POST /client/register

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User
from app.utils.auth import hash_password, create_access_token
from typing import Optional

router = APIRouter()


class ClientRegister(BaseModel):
    name:         str
    email:        EmailStr
    password:     str
    phone:        Optional[str] = None
    company:      Optional[str] = None
    requirements: Optional[str] = None


class ClientLogin(BaseModel):
    email:    EmailStr
    password: str


@router.post("/register")
def register_client(data: ClientRegister, db: Session = Depends(get_db)):
    """
    Client self-registers on the website.
    Returns a JWT token so they can log back in.
    """
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name         = data.name,
        email        = data.email,
        password     = hash_password(data.password),
        phone        = data.phone,
        company      = data.company,
        requirements = data.requirements,
        is_admin     = False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "role": "client", "user_id": user.id})
    return {
        "message":      f"Welcome, {user.name}!",
        "access_token": token,
        "token_type":   "bearer",
        "user_id":      user.id,
    }


@router.post("/login")
def login_client(data: ClientLogin, db: Session = Depends(get_db)):
    """Client logs in — returns JWT token."""
    from app.utils.auth import verify_password
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Wrong email or password")

    token = create_access_token({"sub": user.email, "role": "client", "user_id": user.id})
    return {
        "access_token": token,
        "token_type":   "bearer",
        "user_id":      user.id,
        "name":         user.name,
    }


@router.get("/profile/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    """Get client profile by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id":           user.id,
        "name":         user.name,
        "email":        user.email,
        "phone":        user.phone,
        "company":      user.company,
        "requirements": user.requirements,
        "created_at":   user.created_at,
    }