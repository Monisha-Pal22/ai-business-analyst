# app/database/connection.py
# Connects Python to PostgreSQL database

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine — this is the connection to PostgreSQL
engine = create_engine(DATABASE_URL)

# Each request gets its own database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All models will inherit from this Base
Base = declarative_base()


def get_db():
    """
    This function gives a database session to each API request.
    It automatically closes the session when request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
