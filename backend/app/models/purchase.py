from sqlalchemy import Column, Date, DateTime, Float, Integer, String, func

from app.models.base import Base


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    supplier_name = Column(String(255), nullable=False)
    purchase_number = Column(String(100), nullable=False, unique=True)
    purchase_date = Column(Date, nullable=False)
    total_amount = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

