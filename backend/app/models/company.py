from sqlalchemy import Column, Date, DateTime, Integer, String, func

from app.models.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    address = Column(String(255), nullable=True)
    gst_number = Column(String(32), nullable=True)
    financial_year_start = Column(Date, nullable=True)
    financial_year_end = Column(Date, nullable=True)
    state = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

