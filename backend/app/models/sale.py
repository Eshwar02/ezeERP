from sqlalchemy import Column, Date, DateTime, Float, Integer, String, func

from app.models.base import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    sale_number = Column(String(100), nullable=False, unique=True)
    sale_date = Column(Date, nullable=False)
    total_amount = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

