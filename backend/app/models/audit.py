from sqlalchemy import Column, DateTime, Integer, JSON, String, func

from app.models.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=True, index=True)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

