from sqlalchemy import Column, DateTime, Integer, String, func

from app.models.base import Base


class Ledger(Base):
    __tablename__ = "ledgers"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    group_name = Column(String(100), nullable=True)
    ledger_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

