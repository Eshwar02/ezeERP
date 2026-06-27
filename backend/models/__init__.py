"""SQLAlchemy ORM models for ezeERP.

Core tables (per PDF Section 16). MVP focuses on users, companies, ledgers,
stock items, customers, suppliers, sales, purchases, invoices.
"""
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    companies: Mapped[list["Company"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    gst_number: Mapped[str | None] = mapped_column(String(20))
    financial_year: Mapped[str | None] = mapped_column(String(20))
    contact_info: Mapped[str | None] = mapped_column(String(200))
    state: Mapped[str | None] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    owner: Mapped["User"] = relationship(back_populates="companies")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "gst_number": self.gst_number,
            "financial_year": self.financial_year,
            "contact_info": self.contact_info,
            "state": self.state,
        }


class Group(Base):
    """Accounting groups: Assets, Liabilities, Income, Expenses."""
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    nature: Mapped[str | None] = mapped_column(String(40))  # Asset/Liability/Income/Expense

    def to_dict(self):
        return {"id": self.id, "name": self.name, "nature": self.nature}


class Ledger(Base):
    """Ledger accounts: Customer, Supplier, Expense, Income, Bank, Cash."""
    __tablename__ = "ledgers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    ledger_type: Mapped[str] = mapped_column(String(40), default="General")  # Customer/Supplier/Expense/Income/Bank/Cash
    opening_balance: Mapped[float] = mapped_column(Float, default=0.0)
    balance: Mapped[float] = mapped_column(Float, default=0.0)
    group_id: Mapped[int | None] = mapped_column(ForeignKey("groups.id"))
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "ledger_type": self.ledger_type,
            "opening_balance": self.opening_balance,
            "balance": self.balance,
            "group_id": self.group_id,
            "is_system": self.is_system,
        }


class StockGroup(Base):
    """Stock groups: Electronics, Furniture, Grocery, Medical."""
    __tablename__ = "stock_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name}


class Unit(Base):
    """Units of measure: PCS, BOX, KG, LTR."""
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(40), nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name}


class StockItem(Base):
    __tablename__ = "stock_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str | None] = mapped_column(String(80))
    hsn_code: Mapped[str | None] = mapped_column(String(20))
    purchase_price: Mapped[float] = mapped_column(Float, default=0.0)
    selling_price: Mapped[float] = mapped_column(Float, default=0.0)
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    gst_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    reorder_level: Mapped[float] = mapped_column(Float, default=0.0)
    stock_group_id: Mapped[int | None] = mapped_column(ForeignKey("stock_groups.id"))
    unit_id: Mapped[int | None] = mapped_column(ForeignKey("units.id"))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "sku": self.sku,
            "hsn_code": self.hsn_code,
            "purchase_price": self.purchase_price,
            "selling_price": self.selling_price,
            "quantity": self.quantity,
            "gst_percentage": self.gst_percentage,
            "reorder_level": self.reorder_level,
            "stock_group_id": self.stock_group_id,
            "unit_id": self.unit_id,
        }


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    gst_number: Mapped[str | None] = mapped_column(String(20))
    mobile: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(Text)
    outstanding_balance: Mapped[float] = mapped_column(Float, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "gst_number": self.gst_number,
            "mobile": self.mobile,
            "address": self.address,
            "outstanding_balance": self.outstanding_balance,
        }


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    gst_number: Mapped[str | None] = mapped_column(String(20))
    mobile: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(Text)
    outstanding_dues: Mapped[float] = mapped_column(Float, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "gst_number": self.gst_number,
            "mobile": self.mobile,
            "address": self.address,
            "outstanding_dues": self.outstanding_dues,
        }


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id"))
    invoice_number: Mapped[str] = mapped_column(String(40), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    tax_total: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)

    items: Mapped[list["SaleItem"]] = relationship(
        back_populates="sale", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint("company_id", "invoice_number", name="uq_sale_invoice"),)

    def to_dict(self):
        return {
            "id": self.id,
            "customer_id": self.customer_id,
            "invoice_number": self.invoice_number,
            "date": self.date.isoformat() if self.date else None,
            "subtotal": self.subtotal,
            "tax_total": self.tax_total,
            "total": self.total,
            "items": [i.to_dict() for i in self.items],
        }


class SaleItem(Base):
    __tablename__ = "sale_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sale_id: Mapped[int] = mapped_column(ForeignKey("sales.id"), nullable=False, index=True)
    stock_item_id: Mapped[int | None] = mapped_column(ForeignKey("stock_items.id"))
    name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    rate: Mapped[float] = mapped_column(Float, default=0.0)
    gst_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    amount: Mapped[float] = mapped_column(Float, default=0.0)

    sale: Mapped["Sale"] = relationship(back_populates="items")

    def to_dict(self):
        return {
            "id": self.id,
            "stock_item_id": self.stock_item_id,
            "name": self.name,
            "quantity": self.quantity,
            "rate": self.rate,
            "gst_percentage": self.gst_percentage,
            "amount": self.amount,
        }


class Purchase(Base):
    __tablename__ = "purchases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"))
    bill_number: Mapped[str] = mapped_column(String(40), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    tax_total: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)

    items: Mapped[list["PurchaseItem"]] = relationship(
        back_populates="purchase", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "supplier_id": self.supplier_id,
            "bill_number": self.bill_number,
            "date": self.date.isoformat() if self.date else None,
            "subtotal": self.subtotal,
            "tax_total": self.tax_total,
            "total": self.total,
            "items": [i.to_dict() for i in self.items],
        }


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    purchase_id: Mapped[int] = mapped_column(ForeignKey("purchases.id"), nullable=False, index=True)
    stock_item_id: Mapped[int | None] = mapped_column(ForeignKey("stock_items.id"))
    name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    rate: Mapped[float] = mapped_column(Float, default=0.0)
    gst_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    amount: Mapped[float] = mapped_column(Float, default=0.0)

    purchase: Mapped["Purchase"] = relationship(back_populates="items")

    def to_dict(self):
        return {
            "id": self.id,
            "stock_item_id": self.stock_item_id,
            "name": self.name,
            "quantity": self.quantity,
            "rate": self.rate,
            "gst_percentage": self.gst_percentage,
            "amount": self.amount,
        }


class Voucher(Base):
    """Double-entry accounting voucher header: Contra, Payment, Receipt, Journal."""
    __tablename__ = "vouchers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False, index=True)
    voucher_type: Mapped[str] = mapped_column(String(20), nullable=False)  # Contra/Payment/Receipt/Journal
    number: Mapped[str] = mapped_column(String(40), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    narration: Mapped[str | None] = mapped_column(Text)
    total: Mapped[float] = mapped_column(Float, default=0.0)  # sum of debits (= sum of credits)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    entries: Mapped[list["VoucherEntry"]] = relationship(
        back_populates="voucher", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint("company_id", "voucher_type", "number", name="uq_voucher_number"),)

    def to_dict(self):
        return {
            "id": self.id,
            "voucher_type": self.voucher_type,
            "number": self.number,
            "date": self.date.isoformat() if self.date else None,
            "narration": self.narration,
            "total": self.total,
            "entries": [e.to_dict() for e in self.entries],
        }


class VoucherEntry(Base):
    """A single debit or credit line of a voucher (general ledger posting)."""
    __tablename__ = "voucher_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    voucher_id: Mapped[int] = mapped_column(ForeignKey("vouchers.id"), nullable=False, index=True)
    ledger_id: Mapped[int] = mapped_column(ForeignKey("ledgers.id"), nullable=False, index=True)
    dr_amount: Mapped[float] = mapped_column(Float, default=0.0)
    cr_amount: Mapped[float] = mapped_column(Float, default=0.0)

    voucher: Mapped["Voucher"] = relationship(back_populates="entries")
    ledger: Mapped["Ledger"] = relationship()

    def to_dict(self):
        return {
            "id": self.id,
            "ledger_id": self.ledger_id,
            "ledger_name": self.ledger.name if self.ledger else None,
            "dr_amount": self.dr_amount,
            "cr_amount": self.cr_amount,
        }
