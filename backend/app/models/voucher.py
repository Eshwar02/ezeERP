from sqlalchemy import Column, Date, DateTime, Float, Integer, String, func

from app.models.base import Base


class VoucherEntry(Base):
    __tablename__ = "voucher_entries"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, nullable=False, index=True)
    voucher_type = Column(String(50), nullable=False)
    voucher_date = Column(Date, nullable=False)
    reference_number = Column(String(100), nullable=True)
    ledger_name = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    narration = Column(String(500), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

