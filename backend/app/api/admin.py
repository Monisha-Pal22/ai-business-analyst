# # app/api/admin.py
# # Admin-only routes — protected by JWT token

# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordRequestForm
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from app.database.connection import get_db
# from app.database.models import AdminUser, Service, ChatLog
# from app.utils.auth import hash_password, verify_password, create_access_token, get_current_admin
# from app.chatbot.engine import get_ai_response
# from typing import Optional

# router = APIRouter()


# # ── Login ─────────────────────────────────────────────────
# @router.post("/login")
# def admin_login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     """Admin login — returns JWT token."""
#     admin = db.query(AdminUser).filter(AdminUser.email == form.username).first()
#     if not admin or not verify_password(form.password, admin.password):
#         raise HTTPException(status_code=401, detail="Wrong email or password")

#     token = create_access_token({"sub": admin.email, "role": admin.role})
#     return {"access_token": token, "token_type": "bearer", "role": admin.role}


# # ── Register first admin (run once) ──────────────────────
# class AdminCreate(BaseModel):
#     name:     str
#     email:    str
#     password: str
#     role:     Optional[str] = "analyst"

# @router.post("/register")
# def register_admin(data: AdminCreate, db: Session = Depends(get_db)):
#     """Create a new admin user."""
#     existing = db.query(AdminUser).filter(AdminUser.email == data.email).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     admin = AdminUser(
#         name     = data.name,
#         email    = data.email,
#         password = hash_password(data.password),
#         role     = data.role
#     )
#     db.add(admin)
#     db.commit()
#     return {"message": f"Admin {data.name} created successfully"}


# # ── Services Management ───────────────────────────────────
# class ServiceCreate(BaseModel):
#     title:       str
#     description: str
#     industry:    Optional[str] = "Logistics"
#     pricing:     Optional[str] = "Contact us"
#     features:    Optional[str] = ""

# @router.post("/services/create")
# def create_service(
#     data: ServiceCreate,
#     db: Session = Depends(get_db),
#     current_admin=Depends(get_current_admin)
# ):
#     """Admin creates a new service."""
#     service = Service(**data.dict())
#     db.add(service)
#     db.commit()
#     db.refresh(service)
#     return {"message": "Service created", "id": service.id}


# @router.put("/services/{service_id}")
# def update_service(
#     service_id: int,
#     data: ServiceCreate,
#     db: Session = Depends(get_db),
#     current_admin=Depends(get_current_admin)
# ):
#     """Admin updates an existing service."""
#     service = db.query(Service).filter(Service.id == service_id).first()
#     if not service:
#         raise HTTPException(status_code=404, detail="Service not found")
#     for key, value in data.dict().items():
#         setattr(service, key, value)
#     db.commit()
#     return {"message": "Service updated"}


# @router.delete("/services/{service_id}")
# def delete_service(
#     service_id: int,
#     db: Session = Depends(get_db),
#     current_admin=Depends(get_current_admin)
# ):
#     service = db.query(Service).filter(Service.id == service_id).first()
#     if not service:
#         raise HTTPException(status_code=404, detail="Service not found")
#     service.is_active = False   # soft delete
#     db.commit()
#     return {"message": "Service deactivated"}


# # ── Admin AI Chat (internal analytics) ───────────────────
# class AdminChatRequest(BaseModel):
#     message: str

# @router.post("/chat")
# def admin_chat(
#     request: AdminChatRequest,
#     db: Session = Depends(get_db),
#     current_admin=Depends(get_current_admin)
# ):
#     """Admin asks AI business questions — internal use only."""
#     reply = get_ai_response(request.message, chat_type="admin")

#     # Save log
#     log = ChatLog(message=request.message, response=reply, chat_type="admin")
#     db.add(log)
#     db.commit()

#     return {"reply": reply}


# # ── Analytics Report ──────────────────────────────────────
# @router.get("/analytics/report")
# def get_analytics_report(
#     current_admin=Depends(get_current_admin),
#     db: Session = Depends(get_db)
# ):
#     """Returns summary analytics for admin dashboard."""
#     from app.database.models import Meeting
#     total_meetings   = db.query(Meeting).count()
#     pending_meetings = db.query(Meeting).filter(Meeting.status == "scheduled").count()
#     total_services   = db.query(Service).filter(Service.is_active == True).count()
#     total_chats      = db.query(ChatLog).filter(ChatLog.chat_type == "client").count()

#     return {
#         "total_meetings":   total_meetings,
#         "pending_meetings": pending_meetings,
#         "total_services":   total_services,
#         "total_client_chats": total_chats,
#     }




# app/api/admin.py
# UPGRADED — added role-based access enforcement + audit logging

# from fastapi import APIRouter, Depends, HTTPException, Request, status
# from fastapi.security import OAuth2PasswordRequestForm
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from app.database.connection import get_db
# from app.database.models import AdminUser, Service, ChatLog, AuditLog
# from app.utils.auth import hash_password, verify_password, create_access_token, get_current_admin
# from app.chatbot.engine import get_ai_response
# from typing import Optional

# router = APIRouter()


# # ── Audit helper ──────────────────────────────────────────
# def write_audit(
#     db:          Session,
#     admin_email: str,
#     action:      str,
#     target:      str  = "",
#     detail:      str  = "",
#     ip_address:  str  = "",
#     admin_id:    int  = None,
# ):
#     """Write one audit log entry. Call this after every admin action."""
#     log = AuditLog(
#         admin_id    = admin_id,
#         admin_email = admin_email,
#         action      = action,
#         target      = target,
#         detail      = detail,
#         ip_address  = ip_address,
#     )
#     db.add(log)
#     db.commit()


# # ── Role guard ────────────────────────────────────────────
# ROLE_HIERARCHY = {"analyst": 1, "manager": 2, "superadmin": 3}

# def require_role(minimum_role: str):
#     """
#     FastAPI dependency factory — blocks admins whose role is below minimum_role.
#     Usage: Depends(require_role("manager"))
#     """
#     def checker(current_admin: dict = Depends(get_current_admin)):
#         admin_role  = current_admin.get("role", "analyst")
#         admin_level = ROLE_HIERARCHY.get(admin_role, 0)
#         need_level  = ROLE_HIERARCHY.get(minimum_role, 99)
#         if admin_level < need_level:
#             raise HTTPException(
#                 status_code=403,
#                 detail=f"Access denied. '{minimum_role}' role or higher required. Your role: '{admin_role}'"
#             )
#         return current_admin
#     return checker


# # ── Login ─────────────────────────────────────────────────
# @router.post("/login")
# def admin_login(
#     request: Request,
#     form:    OAuth2PasswordRequestForm = Depends(),
#     db:      Session = Depends(get_db)
# ):
#     """Admin login — returns JWT token. Logs the login attempt."""
#     admin = db.query(AdminUser).filter(AdminUser.email == form.username).first()
#     if not admin or not verify_password(form.password, admin.password):
#         # Log failed login attempt too
#         write_audit(
#             db          = db,
#             admin_email = form.username,
#             action      = "LOGIN_FAILED",
#             ip_address  = request.client.host if request.client else "",
#         )
#         raise HTTPException(status_code=401, detail="Wrong email or password")

#     token = create_access_token({"sub": admin.email, "role": admin.role, "admin_id": admin.id})

#     write_audit(
#         db          = db,
#         admin_id    = admin.id,
#         admin_email = admin.email,
#         action      = "LOGIN",
#         ip_address  = request.client.host if request.client else "",
#     )
#     return {"access_token": token, "token_type": "bearer", "role": admin.role}


# # ── Register admin ────────────────────────────────────────
# class AdminCreate(BaseModel):
#     name:     str
#     email:    str
#     password: str
#     role:     Optional[str] = "analyst"

# @router.post("/register")
# def register_admin(
#     request:       Request,
#     data:          AdminCreate,
#     db:            Session = Depends(get_db),
#     current_admin: dict    = Depends(require_role("superadmin"))   # only superadmin can create admins
# ):
#     existing = db.query(AdminUser).filter(AdminUser.email == data.email).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="Email already registered")

#     admin = AdminUser(
#         name     = data.name,
#         email    = data.email,
#         password = hash_password(data.password),
#         role     = data.role,
#     )
#     db.add(admin)
#     db.commit()
#     db.refresh(admin)

#     write_audit(
#         db          = db,
#         admin_email = current_admin.get("sub"),
#         action      = "CREATE_ADMIN",
#         target      = f"admin:{admin.id}",
#         detail      = f"Created admin {data.email} with role {data.role}",
#         ip_address  = request.client.host if request.client else "",
#     )
#     return {"message": f"Admin {data.name} created successfully"}


# # ── Services Management ───────────────────────────────────
# class ServiceCreate(BaseModel):
#     title:       str
#     description: str
#     industry:    Optional[str] = "Logistics"
#     pricing:     Optional[str] = "Contact us"
#     features:    Optional[str] = ""

# @router.post("/services/create")
# def create_service(
#     request:       Request,
#     data:          ServiceCreate,
#     db:            Session = Depends(get_db),
#     current_admin: dict    = Depends(require_role("manager"))   # analyst cannot create
# ):
#     service = Service(**data.dict())
#     db.add(service)
#     db.commit()
#     db.refresh(service)

#     write_audit(
#         db          = db,
#         admin_email = current_admin.get("sub"),
#         action      = "CREATE_SERVICE",
#         target      = f"service:{service.id}",
#         detail      = f"Title: {data.title}",
#         ip_address  = request.client.host if request.client else "",
#     )
#     return {"message": "Service created", "id": service.id}


# @router.put("/services/{service_id}")
# def update_service(
#     request:       Request,
#     service_id:    int,
#     data:          ServiceCreate,
#     db:            Session = Depends(get_db),
#     current_admin: dict    = Depends(require_role("manager"))
# ):
#     service = db.query(Service).filter(Service.id == service_id).first()
#     if not service:
#         raise HTTPException(status_code=404, detail="Service not found")

#     for key, value in data.dict().items():
#         setattr(service, key, value)
#     db.commit()

#     write_audit(
#         db          = db,
#         admin_email = current_admin.get("sub"),
#         action      = "UPDATE_SERVICE",
#         target      = f"service:{service_id}",
#         ip_address  = request.client.host if request.client else "",
#     )
#     return {"message": "Service updated"}


# @router.delete("/services/{service_id}")
# def delete_service(
#     request:       Request,
#     service_id:    int,
#     db:            Session = Depends(get_db),
#     current_admin: dict    = Depends(require_role("superadmin"))  # only superadmin can delete
# ):
#     service = db.query(Service).filter(Service.id == service_id).first()
#     if not service:
#         raise HTTPException(status_code=404, detail="Service not found")

#     service.is_active = False   # soft delete
#     db.commit()

#     write_audit(
#         db          = db,
#         admin_email = current_admin.get("sub"),
#         action      = "DELETE_SERVICE",
#         target      = f"service:{service_id}",
#         detail      = f"Soft-deleted: {service.title}",
#         ip_address  = request.client.host if request.client else "",
#     )
#     return {"message": "Service deactivated"}


# # ── Admin AI Chat ─────────────────────────────────────────
# class AdminChatRequest(BaseModel):
#     message: str

# @router.post("/chat")
# def admin_chat(
#     request:       Request,
#     req:           AdminChatRequest,
#     db:            Session = Depends(get_db),
#     current_admin: dict    = Depends(require_role("analyst"))   # all roles can chat
# ):
#     reply = get_ai_response(req.message, chat_type="admin")
#     log   = ChatLog(message=req.message, response=reply, chat_type="admin")
#     db.add(log)
#     db.commit()
#     return {"reply": reply}


# # ── Analytics Report ──────────────────────────────────────
# @router.get("/analytics/report")
# def get_analytics_report(
#     current_admin: dict    = Depends(require_role("analyst")),
#     db:            Session = Depends(get_db)
# ):
#     from app.database.models import Meeting
#     total_meetings   = db.query(Meeting).count()
#     pending_meetings = db.query(Meeting).filter(Meeting.status == "scheduled").count()
#     total_services   = db.query(Service).filter(Service.is_active == True).count()
#     total_chats      = db.query(ChatLog).filter(ChatLog.chat_type == "client").count()
#     return {
#         "total_meetings":     total_meetings,
#         "pending_meetings":   pending_meetings,
#         "total_services":     total_services,
#         "total_client_chats": total_chats,
#     }


# # ── Audit Logs Viewer (superadmin only) ───────────────────
# @router.get("/audit-logs")
# def get_audit_logs(
#     limit:         int  = 100,
#     current_admin: dict = Depends(require_role("superadmin")),
#     db:            Session = Depends(get_db)
# ):
#     """Returns recent admin audit logs. Only superadmin can view."""
#     logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
#     return [
#         {
#             "id":          l.id,
#             "admin_email": l.admin_email,
#             "action":      l.action,
#             "target":      l.target,
#             "detail":      l.detail,
#             "ip_address":  l.ip_address,
#             "timestamp":   l.timestamp,
#         }
#         for l in logs
#     ]





# app/api/admin.py — upgraded with meetings query support
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import AdminUser, Service, ChatLog, AuditLog, Meeting
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_admin
from app.chatbot.engine import get_ai_response
from typing import Optional
from datetime import datetime, date

router = APIRouter()

ROLE_HIERARCHY = {"analyst": 1, "manager": 2, "superadmin": 3}

def require_role(minimum_role: str):
    def checker(current_admin: dict = Depends(get_current_admin)):
        admin_role  = current_admin.get("role", "analyst")
        admin_level = ROLE_HIERARCHY.get(admin_role, 0)
        need_level  = ROLE_HIERARCHY.get(minimum_role, 99)
        if admin_level < need_level:
            raise HTTPException(status_code=403, detail=f"Access denied. '{minimum_role}' role or higher required.")
        return current_admin
    return checker

def write_audit(db, admin_email, action, target="", detail="", ip_address="", admin_id=None):
    log = AuditLog(admin_id=admin_id, admin_email=admin_email, action=action, target=target, detail=detail, ip_address=ip_address)
    db.add(log)
    db.commit()

@router.post("/login")
def admin_login(request: Request, form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == form.username).first()
    if not admin or not verify_password(form.password, admin.password):
        write_audit(db=db, admin_email=form.username, action="LOGIN_FAILED", ip_address=request.client.host if request.client else "")
        raise HTTPException(status_code=401, detail="Wrong email or password")
    token = create_access_token({"sub": admin.email, "role": admin.role, "admin_id": admin.id})
    write_audit(db=db, admin_id=admin.id, admin_email=admin.email, action="LOGIN", ip_address=request.client.host if request.client else "")
    return {"access_token": token, "token_type": "bearer", "role": admin.role}

class AdminCreate(BaseModel):
    name: str; email: str; password: str; role: Optional[str] = "analyst"

@router.post("/register")
def register_admin(request: Request, data: AdminCreate, db: Session = Depends(get_db)):
    existing = db.query(AdminUser).filter(AdminUser.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    admin = AdminUser(name=data.name, email=data.email, password=hash_password(data.password), role=data.role)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return {"message": f"Admin {data.name} created successfully"}

class ServiceCreate(BaseModel):
    title: str; description: str; industry: Optional[str] = "Logistics"
    pricing: Optional[str] = "Contact us"; features: Optional[str] = ""

@router.post("/services/create")
def create_service(request: Request, data: ServiceCreate, db: Session = Depends(get_db), current_admin=Depends(require_role("manager"))):
    service = Service(**data.dict())
    db.add(service)
    db.commit()
    db.refresh(service)
    write_audit(db=db, admin_email=current_admin.get("sub"), action="CREATE_SERVICE", target=f"service:{service.id}", detail=f"Title: {data.title}", ip_address=request.client.host if request.client else "")
    return {"message": "Service created", "id": service.id}

@router.put("/services/{service_id}")
def update_service(request: Request, service_id: int, data: ServiceCreate, db: Session = Depends(get_db), current_admin=Depends(require_role("manager"))):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for key, value in data.dict().items():
        setattr(service, key, value)
    db.commit()
    write_audit(db=db, admin_email=current_admin.get("sub"), action="UPDATE_SERVICE", target=f"service:{service_id}", ip_address=request.client.host if request.client else "")
    return {"message": "Service updated"}

@router.delete("/services/{service_id}")
def delete_service(request: Request, service_id: int, db: Session = Depends(get_db), current_admin=Depends(require_role("superadmin"))):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    service.is_active = False
    db.commit()
    write_audit(db=db, admin_email=current_admin.get("sub"), action="DELETE_SERVICE", target=f"service:{service_id}", detail=f"Soft-deleted: {service.title}", ip_address=request.client.host if request.client else "")
    return {"message": "Service deactivated"}

class AdminChatRequest(BaseModel):
    message: str

@router.post("/chat")
def admin_chat(request: Request, req: AdminChatRequest, db: Session = Depends(get_db), current_admin=Depends(require_role("analyst"))):
    # Check if admin is asking about meetings
    message_lower = req.message.lower()
    extra_context = ""
    if any(word in message_lower for word in ["meeting", "today", "schedule", "appointment"]):
        today = date.today()
        meetings = db.query(Meeting).filter(
            Meeting.datetime >= datetime.combine(today, datetime.min.time()),
            Meeting.datetime <  datetime.combine(today, datetime.max.time()),
            Meeting.status == "scheduled"
        ).all()
        if meetings:
            meeting_list = "\n".join([f"- {m.client_name} ({m.client_email}) at {m.datetime.strftime('%H:%M')}" for m in meetings])
            extra_context = f"\n\nToday's scheduled meetings:\n{meeting_list}"
        else:
            extra_context = "\n\nNo meetings scheduled for today."

    full_message = req.message + extra_context
    reply = get_ai_response(full_message, chat_type="admin")
    log = ChatLog(message=req.message, response=reply, chat_type="admin")
    db.add(log)
    db.commit()
    return {"reply": reply}

@router.get("/analytics/report")
def get_analytics_report(current_admin=Depends(require_role("analyst")), db: Session = Depends(get_db)):
    total_meetings   = db.query(Meeting).count()
    pending_meetings = db.query(Meeting).filter(Meeting.status == "scheduled").count()
    total_services   = db.query(Service).filter(Service.is_active == True).count()
    total_chats      = db.query(ChatLog).filter(ChatLog.chat_type == "client").count()
    return {"total_meetings": total_meetings, "pending_meetings": pending_meetings, "total_services": total_services, "total_client_chats": total_chats}

@router.get("/audit-logs")
def get_audit_logs(limit: int = 100, current_admin=Depends(require_role("superadmin")), db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [{"id": l.id, "admin_email": l.admin_email, "action": l.action, "target": l.target, "detail": l.detail, "ip_address": l.ip_address, "timestamp": l.timestamp} for l in logs]