from sqlalchemy import Column, DateTime, Integer, String, func

from app.models.base import Base


class StockGroup(Base):
    __tablename__ = "stock_groups"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

