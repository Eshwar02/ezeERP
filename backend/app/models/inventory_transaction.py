from sqlalchemy import Column, Date, DateTime, Float, Integer, String, func

from app.models.base import Base


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    item_name = Column(String(255), nullable=False, index=True)
    transaction_type = Column(String(50), nullable=False)
    quantity = Column(Float, nullable=False, default=0)
    reference_type = Column(String(50), nullable=True)
    reference_number = Column(String(100), nullable=True)
    transaction_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

