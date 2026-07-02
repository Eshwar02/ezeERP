"""Business logic for vouchers (Sales & Purchase) per PDF Section 7.

Sales voucher  -> create sale, reduce inventory, update customer ledger/balance.
Purchase voucher -> add purchase, increase stock, update supplier dues.
"""
from datetime import datetime, timezone

from models import (
    CreditNote,
    CreditNoteItem,
    Customer,
    DebitNote,
    DebitNoteItem,
    Ledger,
    Purchase,
    PurchaseItem,
    Sale,
    SaleItem,
    StockItem,
    Supplier,
    Voucher,
    VoucherEntry,
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


# --- Accounting: system ledgers + double-entry vouchers (PDF Section 7) ---

# (name, ledger_type, nature) for the default chart of accounts seeded per company.
_SYSTEM_LEDGERS = [
    ("Cash", "Cash", "Asset"),
    ("Bank", "Bank", "Asset"),
    ("Sundry Debtors", "Customer", "Asset"),
    ("Sundry Creditors", "Supplier", "Liability"),
    ("Sales", "Income", "Income"),
    ("Purchase", "Expense", "Expense"),
    ("GST Output", "Liability", "Liability"),
    ("GST Input", "Asset", "Asset"),
]

_VOUCHER_PREFIX = {"Contra": "CON", "Payment": "PAY", "Receipt": "RCP", "Journal": "JRN"}


def seed_system_ledgers(db, company_id):
    """Create the default system ledgers for a company if they don't exist. Idempotent."""
    existing = {
        l.name for l in db.query(Ledger).filter_by(company_id=company_id, is_system=True).all()
    }
    created = False
    for name, ltype, nature in _SYSTEM_LEDGERS:
        if name not in existing:
            db.add(Ledger(company_id=company_id, name=name, ledger_type=ltype, is_system=True))
            created = True
    if created:
        db.commit()


def create_voucher(db, company_id, data):
    """Create a double-entry voucher (Contra/Payment/Receipt/Journal).

    data: {voucher_type, date?, narration?, entries:[{ledger_id, dr_amount, cr_amount}]}
    Enforces >=2 lines and sum(debits) == sum(credits). Posts each line to Ledger.balance.
    """
    vtype = (data.get("voucher_type") or "").strip().title()
    if vtype not in _VOUCHER_PREFIX:
        raise ValueError("Invalid voucher_type (Contra/Payment/Receipt/Journal)")

    raw = data.get("entries") or []
    lines = []
    dr_total = cr_total = 0.0
    for e in raw:
        ledger_id = e.get("ledger_id")
        dr = round(float(e.get("dr_amount") or 0), 2)
        cr = round(float(e.get("cr_amount") or 0), 2)
        if not ledger_id or (dr <= 0 and cr <= 0):
            continue
        if dr > 0 and cr > 0:
            raise ValueError("A line cannot have both debit and credit")
        ledger = db.get(Ledger, int(ledger_id))
        if not ledger or ledger.company_id != company_id:
            raise ValueError("Ledger not found or access denied")
        lines.append((ledger, dr, cr))
        dr_total += dr
        cr_total += cr

    if len(lines) < 2:
        raise ValueError("At least two ledger lines are required")
    if round(dr_total, 2) != round(cr_total, 2):
        raise ValueError("Total debit and credit must be equal")

    number = data.get("number") or _next_voucher_number(db, company_id, vtype)
    voucher = Voucher(
        company_id=company_id,
        voucher_type=vtype,
        number=number,
        narration=data.get("narration"),
        total=round(dr_total, 2),
    )
    db.add(voucher)
    db.flush()

    for ledger, dr, cr in lines:
        db.add(VoucherEntry(voucher_id=voucher.id, ledger_id=ledger.id, dr_amount=dr, cr_amount=cr))
        ledger.balance = (ledger.balance or 0) + dr - cr

    db.commit()
    return voucher


def _next_voucher_number(db, company_id, vtype):
    prefix = _VOUCHER_PREFIX[vtype]
    count = db.query(Voucher).filter_by(company_id=company_id, voucher_type=vtype).count()
    year = datetime.now(timezone.utc).year
    return f"{prefix}-{year}-{count + 1:04d}"


def create_credit_note(db, company_id, data):
    """Sales Return: reverse inventory (stock returns), reduce customer outstanding balance."""
    lines, subtotal, tax_total = _compute_lines(data.get("items") or [])
    if not lines:
        raise ValueError("At least one line item is required")

    count = db.query(CreditNote).filter_by(company_id=company_id).count()
    year = datetime.now(timezone.utc).year
    note_number = data.get("note_number") or f"CN-{year}-{count + 1:04d}"
    total = round(subtotal + tax_total, 2)

    note = CreditNote(
        company_id=company_id,
        customer_id=data.get("customer_id"),
        note_number=note_number,
        subtotal=subtotal,
        tax_total=tax_total,
        total=total,
    )
    db.add(note)
    db.flush()

    for ln in lines:
        db.add(CreditNoteItem(note_id=note.id, **ln))
        # Stock returns — increase inventory
        if ln["stock_item_id"]:
            item = db.get(StockItem, ln["stock_item_id"])
            if item and item.company_id == company_id:
                item.quantity = (item.quantity or 0) + ln["quantity"]

    # Customer balance reduces (goods returned)
    if note.customer_id:
        cust = db.get(Customer, note.customer_id)
        if cust and cust.company_id == company_id:
            cust.outstanding_balance = max(0, (cust.outstanding_balance or 0) - total)

    db.commit()
    return note


def create_debit_note(db, company_id, data):
    """Purchase Return: send stock back, reduce supplier outstanding dues."""
    lines, subtotal, tax_total = _compute_lines(data.get("items") or [])
    if not lines:
        raise ValueError("At least one line item is required")

    count = db.query(DebitNote).filter_by(company_id=company_id).count()
    year = datetime.now(timezone.utc).year
    note_number = data.get("note_number") or f"DN-{year}-{count + 1:04d}"
    total = round(subtotal + tax_total, 2)

    note = DebitNote(
        company_id=company_id,
        supplier_id=data.get("supplier_id"),
        note_number=note_number,
        subtotal=subtotal,
        tax_total=tax_total,
        total=total,
    )
    db.add(note)
    db.flush()

    for ln in lines:
        db.add(DebitNoteItem(note_id=note.id, **ln))
        # Stock goes back to supplier — decrease inventory
        if ln["stock_item_id"]:
            item = db.get(StockItem, ln["stock_item_id"])
            if item and item.company_id == company_id:
                item.quantity = (item.quantity or 0) - ln["quantity"]

    # Supplier dues reduce (goods returned)
    if note.supplier_id:
        sup = db.get(Supplier, note.supplier_id)
        if sup and sup.company_id == company_id:
            sup.outstanding_dues = max(0, (sup.outstanding_dues or 0) - total)

    db.commit()
    return note
