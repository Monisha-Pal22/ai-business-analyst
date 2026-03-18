# # # # app/database/models.py
# # # # Defines all database tables as Python classes

# # # from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
# # # from sqlalchemy.orm import relationship
# # # from datetime import datetime
# # # from app.database.connection import Base


# # # class User(Base):
# # #     """Stores client/user information."""
# # #     __tablename__ = "users"

# # #     id          = Column(Integer, primary_key=True, index=True)
# # #     name        = Column(String(100), nullable=False)
# # #     email       = Column(String(100), unique=True, index=True, nullable=False)
# # #     phone       = Column(String(20))
# # #     company     = Column(String(100))
# # #     requirements = Column(Text)
# # #     is_admin    = Column(Boolean, default=False)
# # #     password    = Column(String(255), nullable=False)
# # #     created_at  = Column(DateTime, default=datetime.utcnow)

# # #     # One user can have many meetings and chat logs
# # #     meetings    = relationship("Meeting",  back_populates="client")
# # #     chat_logs   = relationship("ChatLog", back_populates="user")


# # # class Service(Base):
# # #     """Stores logistics services offered by the company."""
# # #     __tablename__ = "services"

# # #     id          = Column(Integer, primary_key=True, index=True)
# # #     title       = Column(String(200), nullable=False)
# # #     description = Column(Text)
# # #     industry    = Column(String(100), default="Logistics")
# # #     pricing     = Column(String(100))
# # #     features    = Column(Text)   # store as comma-separated or JSON string
# # #     is_active   = Column(Boolean, default=True)
# # #     created_at  = Column(DateTime, default=datetime.utcnow)


# # # class Meeting(Base):
# # #     """Stores meeting bookings from clients."""
# # #     __tablename__ = "meetings"

# # #     id           = Column(Integer, primary_key=True, index=True)
# # #     client_id    = Column(Integer, ForeignKey("users.id"))
# # #     client_name  = Column(String(100))
# # #     client_email = Column(String(100))
# # #     datetime     = Column(DateTime, nullable=False)
# # #     meeting_link = Column(String(300))
# # #     status       = Column(String(50), default="scheduled")  # scheduled, completed, cancelled
# # #     notes        = Column(Text)
# # #     created_at   = Column(DateTime, default=datetime.utcnow)

# # #     client = relationship("User", back_populates="meetings")


# # # class ChatLog(Base):
# # #     """Stores all chat messages — both client and admin."""
# # #     __tablename__ = "chat_logs"

# # #     id         = Column(Integer, primary_key=True, index=True)
# # #     user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
# # #     session_id = Column(String(100))   # for anonymous users
# # #     message    = Column(Text, nullable=False)
# # #     response   = Column(Text)
# # #     chat_type  = Column(String(20), default="client")  # client or admin
# # #     timestamp  = Column(DateTime, default=datetime.utcnow)

# # #     user = relationship("User", back_populates="chat_logs")


# # # class AdminUser(Base):
# # #     """Admin accounts for the dashboard."""
# # #     __tablename__ = "admin_users"

# # #     id         = Column(Integer, primary_key=True, index=True)
# # #     name       = Column(String(100), nullable=False)
# # #     email      = Column(String(100), unique=True, nullable=False)
# # #     password   = Column(String(255), nullable=False)
# # #     role       = Column(String(50), default="analyst")  # analyst, manager, superadmin
# # #     created_at = Column(DateTime, default=datetime.utcnow)




# # # app/database/models.py
# # # Defines all database tables as Python classes

# # from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, func
# # from sqlalchemy.orm import relationship
# # from app.database.connection import Base


# # class User(Base):
# #     """Stores client/user information."""
# #     __tablename__ = "users"

# #     id          = Column(Integer, primary_key=True, index=True)
# #     name        = Column(String(100), nullable=False)
# #     email       = Column(String(100), unique=True, index=True, nullable=False)
# #     phone       = Column(String(20))
# #     company     = Column(String(100))
# #     requirements = Column(Text)
# #     is_admin    = Column(Boolean, default=False)
# #     password    = Column(String(255), nullable=False)
# #     created_at  = Column(DateTime, default=func.now())

# #     # One user can have many meetings and chat logs
# #     meetings    = relationship("Meeting",  back_populates="client")
# #     chat_logs   = relationship("ChatLog", back_populates="user")


# # class Service(Base):
# #     """Stores logistics services offered by the company."""
# #     __tablename__ = "services"

# #     id          = Column(Integer, primary_key=True, index=True)
# #     title       = Column(String(200), nullable=False)
# #     description = Column(Text)
# #     industry    = Column(String(100), default="Logistics")
# #     pricing     = Column(String(100))
# #     features    = Column(Text)   # store as comma-separated or JSON string
# #     is_active   = Column(Boolean, default=True)
# #     created_at  = Column(DateTime, default=func.now())


# # class Meeting(Base):
# #     """Stores meeting bookings from clients."""
# #     __tablename__ = "meetings"

# #     id           = Column(Integer, primary_key=True, index=True)
# #     client_id    = Column(Integer, ForeignKey("users.id"))
# #     client_name  = Column(String(100))
# #     client_email = Column(String(100))
# #     datetime     = Column(DateTime, nullable=False)
# #     meeting_link = Column(String(300))
# #     status       = Column(String(50), default="scheduled")  # scheduled, completed, cancelled
# #     notes        = Column(Text)
# #     created_at   = Column(DateTime, default=func.now())

# #     client = relationship("User", back_populates="meetings")


# # class ChatLog(Base):
# #     """Stores all chat messages — both client and admin."""
# #     __tablename__ = "chat_logs"

# #     id         = Column(Integer, primary_key=True, index=True)
# #     user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
# #     session_id = Column(String(100))   # for anonymous users
# #     message    = Column(Text, nullable=False)
# #     response   = Column(Text)
# #     chat_type  = Column(String(20), default="client")  # client or admin
# #     timestamp  = Column(DateTime, default=func.now())

# #     user = relationship("User", back_populates="chat_logs")


# # class AdminUser(Base):
# #     """Admin accounts for the dashboard."""
# #     __tablename__ = "admin_users"

# #     id         = Column(Integer, primary_key=True, index=True)
# #     name       = Column(String(100), nullable=False)
# #     email      = Column(String(100), unique=True, nullable=False)
# #     password   = Column(String(255), nullable=False)
# #     role       = Column(String(50), default="analyst")  # analyst, manager, superadmin
# #     created_at = Column(DateTime, default=func.now())





# # app/database/models.py
# # Defines all database tables as Python classes

# from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
# from sqlalchemy.orm import relationship
# from datetime import datetime
# from app.database.connection import Base
# from datetime import datetime, timezone
# from sqlalchemy import func


# class User(Base):
#     """Stores client/user information."""
#     __tablename__ = "users"

#     id           = Column(Integer, primary_key=True, index=True)
#     name         = Column(String(100), nullable=False)
#     email        = Column(String(100), unique=True, index=True, nullable=False)
#     phone        = Column(String(20))
#     company      = Column(String(100))
#     requirements = Column(Text)
#     is_admin     = Column(Boolean, default=False)
#     password     = Column(String(255), nullable=False)
#     created_at   = Column(DateTime, default=datetime.utcnow)

#     meetings  = relationship("Meeting",  back_populates="client")
#     chat_logs = relationship("ChatLog",  back_populates="user")


# class Service(Base):
#     """Stores logistics services offered by the company."""
#     __tablename__ = "services"

#     id          = Column(Integer, primary_key=True, index=True)
#     title       = Column(String(200), nullable=False)
#     description = Column(Text)
#     industry    = Column(String(100), default="Logistics")
#     pricing     = Column(String(100))
#     features    = Column(Text)
#     is_active   = Column(Boolean, default=True)
#     created_at  = Column(DateTime, default=datetime.utcnow)


# class Meeting(Base):
#     """Stores meeting bookings from clients."""
#     __tablename__ = "meetings"

#     id           = Column(Integer, primary_key=True, index=True)
#     client_id    = Column(Integer, ForeignKey("users.id"))
#     client_name  = Column(String(100))
#     client_email = Column(String(100))
#     datetime     = Column(DateTime, nullable=False)
#     meeting_link = Column(String(300))
#     status       = Column(String(50), default="scheduled")
#     notes        = Column(Text)
#     created_at   = Column(DateTime, default=datetime.utcnow)

#     client = relationship("User", back_populates="meetings")


# class ChatLog(Base):
#     """Stores all chat messages — both client and admin."""
#     __tablename__ = "chat_logs"

#     id         = Column(Integer, primary_key=True, index=True)
#     user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
#     session_id = Column(String(100))
#     message    = Column(Text, nullable=False)
#     response   = Column(Text)
#     chat_type  = Column(String(20), default="client")
#     timestamp  = Column(DateTime, default=datetime.utcnow)

#     user = relationship("User", back_populates="chat_logs")


# class AdminUser(Base):
#     """Admin accounts for the dashboard."""
#     __tablename__ = "admin_users"

#     id         = Column(Integer, primary_key=True, index=True)
#     name       = Column(String(100), nullable=False)
#     email      = Column(String(100), unique=True, nullable=False)
#     password   = Column(String(255), nullable=False)
#     role       = Column(String(50), default="analyst")  # analyst, manager, superadmin
#     created_at = Column(DateTime, default=datetime.utcnow)

#     audit_logs = relationship("AuditLog", back_populates="admin")


# # ── NEW: AuditLog ─────────────────────────────────────────
# class AuditLog(Base):
#     """
#     NEW TABLE — tracks every admin action for security and compliance.
#     Every create / update / delete / login action by an admin is saved here.
#     """
#     __tablename__ = "audit_logs"

#     id          = Column(Integer, primary_key=True, index=True)
#     admin_id    = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
#     admin_email = Column(String(100))           # stored directly so log survives account deletion
#     action      = Column(String(100), nullable=False)   # e.g. "CREATE_SERVICE", "DELETE_SERVICE", "LOGIN"
#     target      = Column(String(200))           # e.g. "service:12", "meeting:5"
#     detail      = Column(Text)                  # extra JSON/text info
#     ip_address  = Column(String(50))
#     timestamp   = Column(DateTime, default=datetime.utcnow)

#     admin = relationship("AdminUser", back_populates="audit_logs")


# # ── NEW: RouteMetric ──────────────────────────────────────
# class RouteMetric(Base):
#     """
#     NEW TABLE — stores route efficiency data for each delivery route.
#     Feeds the analytics engine with real DB data instead of hardcoded values.
#     """
#     __tablename__ = "route_metrics"

#     id                   = Column(Integer, primary_key=True, index=True)
#     route_name           = Column(String(200), nullable=False)
#     distance_km          = Column(Float)
#     planned_duration_hrs = Column(Float)
#     actual_duration_hrs  = Column(Float)
#     fuel_used_liters     = Column(Float)
#     on_time              = Column(Boolean, default=True)
#     driver_name          = Column(String(100))
#     vehicle_id           = Column(String(50))
#     recorded_at          = Column(DateTime, default=datetime.utcnow)

#     @property
#     def efficiency_pct(self) -> float:
#         """Route efficiency = planned / actual × 100. Lower actual = more efficient."""
#         if not self.actual_duration_hrs or self.actual_duration_hrs == 0:
#             return 0.0
#         return round((self.planned_duration_hrs / self.actual_duration_hrs) * 100, 1)





# app/database/models.py
# Defines all database tables as Python classes

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.connection import Base


class User(Base):
    """Stores client/user information."""
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(100), nullable=False)
    email        = Column(String(100), unique=True, index=True, nullable=False)
    phone        = Column(String(20))
    company      = Column(String(100))
    requirements = Column(Text)
    is_admin     = Column(Boolean, default=False)
    password     = Column(String(255), nullable=False)
    created_at   = Column(DateTime, server_default=func.now())

    meetings  = relationship("Meeting",  back_populates="client")
    chat_logs = relationship("ChatLog",  back_populates="user")


class Service(Base):
    """Stores logistics services offered by the company."""
    __tablename__ = "services"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(Text)
    industry    = Column(String(100), default="Logistics")
    pricing     = Column(String(100))
    features    = Column(Text)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, server_default=func.now())


class Meeting(Base):
    """Stores meeting bookings from clients."""
    __tablename__ = "meetings"

    id           = Column(Integer, primary_key=True, index=True)
    client_id    = Column(Integer, ForeignKey("users.id"))
    client_name  = Column(String(100))
    client_email = Column(String(100))
    datetime     = Column(DateTime, nullable=False)
    meeting_link = Column(String(300))
    status       = Column(String(50), default="scheduled")
    notes        = Column(Text)
    created_at   = Column(DateTime, server_default=func.now())

    client = relationship("User", back_populates="meetings")


class ChatLog(Base):
    """Stores all chat messages — both client and admin."""
    __tablename__ = "chat_logs"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100))
    message    = Column(Text, nullable=False)
    response   = Column(Text)
    chat_type  = Column(String(20), default="client")
    timestamp  = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="chat_logs")


class AdminUser(Base):
    """Admin accounts for the dashboard."""
    __tablename__ = "admin_users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(100), unique=True, nullable=False)
    password   = Column(String(255), nullable=False)
    role       = Column(String(50), default="analyst")
    created_at = Column(DateTime, server_default=func.now())

    audit_logs = relationship("AuditLog", back_populates="admin")


class AuditLog(Base):
    """Tracks every admin action for security and compliance."""
    __tablename__ = "audit_logs"

    id          = Column(Integer, primary_key=True, index=True)
    admin_id    = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    admin_email = Column(String(100))
    action      = Column(String(100), nullable=False)
    target      = Column(String(200))
    detail      = Column(Text)
    ip_address  = Column(String(50))
    timestamp   = Column(DateTime, server_default=func.now())

    admin = relationship("AdminUser", back_populates="audit_logs")


class RouteMetric(Base):
    """Stores route efficiency data for each delivery route."""
    __tablename__ = "route_metrics"

    id                   = Column(Integer, primary_key=True, index=True)
    route_name           = Column(String(200), nullable=False)
    distance_km          = Column(Float)
    planned_duration_hrs = Column(Float)
    actual_duration_hrs  = Column(Float)
    fuel_used_liters     = Column(Float)
    on_time              = Column(Boolean, default=True)
    driver_name          = Column(String(100))
    vehicle_id           = Column(String(50))
    recorded_at          = Column(DateTime, server_default=func.now())

    @property
    def efficiency_pct(self) -> float:
        if not self.actual_duration_hrs or self.actual_duration_hrs == 0:
            return 0.0
        return round((self.planned_duration_hrs / self.actual_duration_hrs) * 100, 1)