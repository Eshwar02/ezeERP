"""Business logic for vouchers (Sales & Purchase) per PDF Section 7.

Sales voucher  -> create sale, reduce inventory, update customer ledger/balance.
Purchase voucher -> add purchase, increase stock, update supplier dues.
"""
from datetime import datetime, timezone

from models import (
    Customer,
    Purchase,
    PurchaseItem,
    Sale,
    SaleItem,
    StockItem,
    Supplier,
)


def _next_number(db, model, company_id, prefix):
    count = db.query(model).filter_by(company_id=company_id).count()
    year = datetime.now(timezone.utc).year
    return f"{prefix}-{year}-{count + 1:04d}"


def _compute_lines(lines):
    """Return (clean_lines, subtotal, tax_total). Each line: name, quantity, rate, gst_percentage."""
    clean, subtotal, tax_total = [], 0.0, 0.0
    for ln in lines:
        qty = float(ln.get("quantity") or 0)
        rate = float(ln.get("rate") or 0)
        gst = float(ln.get("gst_percentage") or 0)
        base = qty * rate
        tax = base * gst / 100.0
        subtotal += base
        tax_total += tax
        clean.append(
            {
                "stock_item_id": ln.get("stock_item_id"),
                "name": ln.get("name") or "",
                "quantity": qty,
                "rate": rate,
                "gst_percentage": gst,
                "amount": round(base + tax, 2),
            }
        )
    return clean, round(subtotal, 2), round(tax_total, 2)


def create_sale(db, company_id, data):
    """Create a sales voucher: generates invoice no, reduces stock, updates customer."""
    lines, subtotal, tax_total = _compute_lines(data.get("items") or [])
    if not lines:
        raise ValueError("At least one line item is required")

    invoice_number = data.get("invoice_number") or _next_number(db, Sale, company_id, "INV")
    total = round(subtotal + tax_total, 2)

    sale = Sale(
        company_id=company_id,
        customer_id=data.get("customer_id"),
        invoice_number=invoice_number,
        subtotal=subtotal,
        tax_total=tax_total,
        total=total,
    )
    db.add(sale)
    db.flush()

    for ln in lines:
        db.add(SaleItem(sale_id=sale.id, **ln))
        # Reduce Inventory
        if ln["stock_item_id"]:
            item = db.get(StockItem, ln["stock_item_id"])
            if item and item.company_id == company_id:
                item.quantity = (item.quantity or 0) - ln["quantity"]

    # Update Customer Ledger (outstanding balance grows by invoice total)
    if sale.customer_id:
        cust = db.get(Customer, sale.customer_id)
        if cust and cust.company_id == company_id:
            cust.outstanding_balance = (cust.outstanding_balance or 0) + total

    db.commit()
    return sale


def create_purchase(db, company_id, data):
    """Create a purchase voucher: generates bill no, increases stock, updates supplier dues."""
    lines, subtotal, tax_total = _compute_lines(data.get("items") or [])
    if not lines:
        raise ValueError("At least one line item is required")

    bill_number = data.get("bill_number") or _next_number(db, Purchase, company_id, "PUR")
    total = round(subtotal + tax_total, 2)

    purchase = Purchase(
        company_id=company_id,
        supplier_id=data.get("supplier_id"),
        bill_number=bill_number,
        subtotal=subtotal,
        tax_total=tax_total,
        total=total,
    )
    db.add(purchase)
    db.flush()

    for ln in lines:
        db.add(PurchaseItem(purchase_id=purchase.id, **ln))
        # Update Stock (increase)
        if ln["stock_item_id"]:
            item = db.get(StockItem, ln["stock_item_id"])
            if item and item.company_id == company_id:
                item.quantity = (item.quantity or 0) + ln["quantity"]

    # Update Supplier Ledger (dues grow by bill total)
    if purchase.supplier_id:
        sup = db.get(Supplier, purchase.supplier_id)
        if sup and sup.company_id == company_id:
            sup.outstanding_dues = (sup.outstanding_dues or 0) + total

    db.commit()
    return purchase
