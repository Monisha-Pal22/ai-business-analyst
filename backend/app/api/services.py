# app/api/services.py
# Public API — returns list of logistics services

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Service
from typing import List, Optional

router = APIRouter()


class ServiceOut(BaseModel):
    id:          int
    title:       str
    description: str
    industry:    str
    pricing:     str
    features:    str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ServiceOut])
def get_all_services(db: Session = Depends(get_db)):
    """Return all active services — used by client-side website."""
    return db.query(Service).filter(Service.is_active == True).all()


@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    """Get a single service by ID."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service
