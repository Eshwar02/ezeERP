from sqlalchemy import Column, DateTime, Float, Integer, String, func

from app.models.base import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    gst_number = Column(String(32), nullable=True)
    mobile_number = Column(String(32), nullable=True)
    address = Column(String(255), nullable=True)
    outstanding_balance = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

