from sqlalchemy import Column, DateTime, Integer, String, func

from app.models.base import Base


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    symbol = Column(String(20), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

