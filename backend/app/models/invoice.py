from sqlalchemy import Column, DateTime, Integer, String, func

from app.models.base import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    invoice_number = Column(String(50), nullable=False, unique=True)
    invoice_type = Column(String(50), nullable=False)
    customer_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="draft")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

