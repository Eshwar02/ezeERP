from sqlalchemy import Column, DateTime, Float, Integer, String, func

from app.models.base import Base


class StockItem(Base):
    __tablename__ = "stock_items"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), nullable=True, index=True)
    hsn_code = Column(String(50), nullable=True)
    quantity = Column(Float, nullable=False, default=0)
    purchase_price = Column(Float, nullable=False, default=0)
    selling_price = Column(Float, nullable=False, default=0)
    gst_percent = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

