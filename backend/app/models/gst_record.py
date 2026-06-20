from sqlalchemy import Column, Date, DateTime, Float, Integer, String, func

from app.models.base import Base


class GSTRecord(Base):
    __tablename__ = "gst_records"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    tax_type = Column(String(10), nullable=False)
    taxable_value = Column(Float, nullable=False, default=0)
    tax_amount = Column(Float, nullable=False, default=0)
    return_period = Column(String(20), nullable=True)
    record_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

