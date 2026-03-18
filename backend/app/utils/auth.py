# app/utils/auth.py
# Handles password hashing and JWT token creation/verification

import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# Password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme — reads token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")


def hash_password(password: str) -> str:
    """Convert plain password to hashed version."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Check if plain password matches hashed password."""
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    """Create a JWT token with expiry."""
    to_encode = data.copy()
    expire    = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


def get_current_admin(token: str = Depends(oauth2_scheme)) -> dict:
    """FastAPI dependency — protects admin routes."""
    return decode_token(token)
