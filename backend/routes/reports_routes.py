"""Reports module (PDF Section 14): Balance Sheet, P&L, Trial Balance,
Stock Summary, Sales, Purchase, and GST reports. All company-scoped.
"""
from flask import Blueprint, g, jsonify, request, send_file
from sqlalchemy import func

from auth import require_company
from database import get_session
from models import (
    CreditNote, CreditNoteItem, Customer, DebitNote, DebitNoteItem,
    Ledger, Purchase, PurchaseItem, Sale, SaleItem, StockItem, Supplier, Voucher,
)
from utils import build_report_xlsx

reports_bp = Blueprint("reports", __name__)


@reports_bp.before_request
def _guard():
    if request.method == "OPTIONS":
        return None
    return require_company()


@reports_bp.get("/balance-sheet")
def balance_sheet():
    db = get_session()
    cid = g.company.id
    ledgers = db.query(Ledger).filter_by(company_id=cid).all()
    asset_types = {"Cash", "Bank", "Customer", "Asset", "GST Input"}
    liability_types = {"Supplier", "Liability", "GST Output"}
    assets = [l for l in ledgers if l.ledger_type in asset_types]
    liabilities = [l for l in ledgers if l.ledger_type in liability_types]
    return jsonify({
        "assets": [{"name": l.name, "type": l.ledger_type, "balance": round(l.balance or 0, 2)} for l in assets],
        "liabilities": [{"name": l.name, "type": l.ledger_type, "balance": round(l.balance or 0, 2)} for l in liabilities],
        "total_assets": round(sum(l.balance or 0 for l in assets), 2),
        "total_liabilities": round(sum(l.balance or 0 for l in liabilities), 2),
    })


@reports_bp.get("/profit-loss")
def profit_loss():
    db = get_session()
    cid = g.company.id
    sales_total = float(db.query(func.sum(Sale.total)).filter(Sale.company_id == cid).scalar() or 0)
    sales_tax = float(db.query(func.sum(Sale.tax_total)).filter(Sale.company_id == cid).scalar() or 0)
    purchase_total = float(db.query(func.sum(Purchase.total)).filter(Purchase.company_id == cid).scalar() or 0)
    purchase_tax = float(db.query(func.sum(Purchase.tax_total)).filter(Purchase.company_id == cid).scalar() or 0)
    income_ledgers = db.query(Ledger).filter_by(company_id=cid, ledger_type="Income").all()
    expense_ledgers = db.query(Ledger).filter_by(company_id=cid, ledger_type="Expense").all()
    other_income = sum(l.balance or 0 for l in income_ledgers)
    other_expense = sum(l.balance or 0 for l in expense_ledgers)
    total_income = round(sales_total + other_income, 2)
    total_expense = round(purchase_total + other_expense, 2)
    return jsonify({
        "sales_total": round(sales_total, 2),
        "sales_tax": round(sales_tax, 2),
        "purchase_total": round(purchase_total, 2),
        "purchase_tax": round(purchase_tax, 2),
        "income_ledgers": [{"name": l.name, "balance": round(l.balance or 0, 2)} for l in income_ledgers],
        "expense_ledgers": [{"name": l.name, "balance": round(l.balance or 0, 2)} for l in expense_ledgers],
        "total_income": total_income,
        "total_expense": total_expense,
        "net_profit": round(total_income - total_expense, 2),
    })


@reports_bp.get("/trial-balance")
def trial_balance():
    db = get_session()
    ledgers = db.query(Ledger).filter_by(company_id=g.company.id).order_by(Ledger.name).all()
    rows = []
    for l in ledgers:
        bal = l.balance or 0
        rows.append({
            "name": l.name,
            "ledger_type": l.ledger_type,
            "dr_balance": round(bal, 2) if bal > 0 else 0.0,
            "cr_balance": round(-bal, 2) if bal < 0 else 0.0,
        })
    return jsonify({
        "rows": rows,
        "total_dr": round(sum(r["dr_balance"] for r in rows), 2),
        "total_cr": round(sum(r["cr_balance"] for r in rows), 2),
    })


@reports_bp.get("/stock-summary")
def stock_summary():
    db = get_session()
    items = db.query(StockItem).filter_by(company_id=g.company.id).order_by(StockItem.name).all()
    rows = []
    for it in items:
        qty = it.quantity or 0
        value = round(qty * (it.purchase_price or 0), 2)
        rows.append({
            "name": it.name,
            "sku": it.sku,
            "quantity": qty,
            "purchase_price": it.purchase_price or 0,
            "selling_price": it.selling_price or 0,
            "value": value,
            "reorder_level": it.reorder_level or 0,
            "low_stock": qty <= (it.reorder_level or 0),
        })
    return jsonify({
        "items": rows,
        "total_value": round(sum(r["value"] for r in rows), 2),
        "low_stock_count": sum(1 for r in rows if r["low_stock"]),
    })


@reports_bp.get("/sales")
def sales_report():
    db = get_session()
    cid = g.company.id
    sales = db.query(Sale).filter_by(company_id=cid).order_by(Sale.date.desc()).all()
    rows = []
    for s in sales:
        cust = db.get(Customer, s.customer_id) if s.customer_id else None
        rows.append({
            "invoice_number": s.invoice_number,
            "date": s.date.isoformat() if s.date else None,
            "customer": cust.name if cust else "Cash",
            "subtotal": s.subtotal,
            "tax_total": s.tax_total,
            "total": s.total,
        })
    return jsonify({
        "sales": rows,
        "total": round(sum(r["total"] for r in rows), 2),
        "count": len(rows),
    })


@reports_bp.get("/purchases")
def purchases_report():
    db = get_session()
    cid = g.company.id
    purchases = db.query(Purchase).filter_by(company_id=cid).order_by(Purchase.date.desc()).all()
    rows = []
    for p in purchases:
        sup = db.get(Supplier, p.supplier_id) if p.supplier_id else None
        rows.append({
            "bill_number": p.bill_number,
            "date": p.date.isoformat() if p.date else None,
            "supplier": sup.name if sup else "—",
            "subtotal": p.subtotal,
            "tax_total": p.tax_total,
            "total": p.total,
        })
    return jsonify({
        "purchases": rows,
        "total": round(sum(r["total"] for r in rows), 2),
        "count": len(rows),
    })


@reports_bp.get("/gst")
def gst_report():
    db = get_session()
    cid = g.company.id
    gst_collected = float(db.query(func.sum(Sale.tax_total)).filter(Sale.company_id == cid).scalar() or 0)
    gst_paid = float(db.query(func.sum(Purchase.tax_total)).filter(Purchase.company_id == cid).scalar() or 0)
    net = round(gst_collected - gst_paid, 2)
    return jsonify({
        "gst_collected": round(gst_collected, 2),
        "gst_paid": round(gst_paid, 2),
        "net_gst_payable": net,
        "cgst_collected": round(gst_collected / 2, 2),
        "sgst_collected": round(gst_collected / 2, 2),
        "cgst_paid": round(gst_paid / 2, 2),
        "sgst_paid": round(gst_paid / 2, 2),
        "igst_collected": 0.0,
        "igst_paid": 0.0,
    })


# --- Excel export (openpyxl). Reuses each report's JSON view, reshaped to sheets. ---

def _sections_balance_sheet(d):
    return [
        {"name": "Assets", "headers": ["Name", "Type", "Balance"],
         "rows": [[a["name"], a["type"], a["balance"]] for a in d["assets"]],
         "total": ["Total Assets", "", d["total_assets"]]},
        {"name": "Liabilities", "headers": ["Name", "Type", "Balance"],
         "rows": [[l["name"], l["type"], l["balance"]] for l in d["liabilities"]],
         "total": ["Total Liabilities", "", d["total_liabilities"]]},
    ]


def _sections_profit_loss(d):
    return [
        {"name": "Income", "headers": ["Source", "Amount"],
         "rows": [["Sales", d["sales_total"]]] + [[l["name"], l["balance"]] for l in d["income_ledgers"]],
         "total": ["Total Income", d["total_income"]]},
        {"name": "Expenses", "headers": ["Source", "Amount"],
         "rows": [["Purchases", d["purchase_total"]]] + [[l["name"], l["balance"]] for l in d["expense_ledgers"]],
         "total": ["Total Expense", d["total_expense"]]},
        {"name": "Result", "headers": ["", "Net Profit"], "rows": [], "total": ["", d["net_profit"]]},
    ]


def _sections_trial_balance(d):
    return [{"name": "Trial Balance", "headers": ["Ledger", "Type", "Debit", "Credit"],
             "rows": [[r["name"], r["ledger_type"], r["dr_balance"], r["cr_balance"]] for r in d["rows"]],
             "total": ["Total", "", d["total_dr"], d["total_cr"]]}]


def _sections_stock_summary(d):
    return [{"name": "Stock Summary", "headers": ["Item", "SKU", "Qty", "Purchase", "Selling", "Value"],
             "rows": [[i["name"], i["sku"], i["quantity"], i["purchase_price"], i["selling_price"], i["value"]] for i in d["items"]],
             "total": ["Total Value", "", "", "", "", d["total_value"]]}]


def _sections_sales(d):
    return [{"name": "Sales", "headers": ["Invoice #", "Date", "Customer", "Subtotal", "Tax", "Total"],
             "rows": [[s["invoice_number"], s["date"], s["customer"], s["subtotal"], s["tax_total"], s["total"]] for s in d["sales"]],
             "total": ["Total", "", "", "", "", d["total"]]}]


def _sections_purchases(d):
    return [{"name": "Purchases", "headers": ["Bill #", "Date", "Supplier", "Subtotal", "Tax", "Total"],
             "rows": [[p["bill_number"], p["date"], p["supplier"], p["subtotal"], p["tax_total"], p["total"]] for p in d["purchases"]],
             "total": ["Total", "", "", "", "", d["total"]]}]


def _sections_gst(d):
    return [{"name": "GST Summary", "headers": ["Metric", "Amount"], "rows": [
        ["GST Collected (Output)", d["gst_collected"]],
        ["  CGST", d["cgst_collected"]],
        ["  SGST", d["sgst_collected"]],
        ["GST Paid (Input)", d["gst_paid"]],
        ["  CGST", d["cgst_paid"]],
        ["  SGST", d["sgst_paid"]],
    ], "total": ["Net GST Payable", d["net_gst_payable"]]}]


_EXPORTS = {
    "balance-sheet": ("Balance Sheet", balance_sheet, _sections_balance_sheet),
    "profit-loss": ("Profit and Loss", profit_loss, _sections_profit_loss),
    "trial-balance": ("Trial Balance", trial_balance, _sections_trial_balance),
    "stock-summary": ("Stock Summary", stock_summary, _sections_stock_summary),
    "sales": ("Sales Report", sales_report, _sections_sales),
    "purchases": ("Purchase Report", purchases_report, _sections_purchases),
    "gst": ("GST Report", gst_report, _sections_gst),
}


@reports_bp.get("/<report>/export.xlsx")
def export_report(report):
    spec = _EXPORTS.get(report)
    if not spec:
        return jsonify({"error": "Unknown report"}), 404
    title, view, to_sections = spec
    data = view().get_json()
    xlsx = build_report_xlsx(title, to_sections(data))
    return send_file(
        xlsx,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=f"{report}.xlsx",
    )


# ── Cash Flow (PDF Section 14) ──────────────────────────────────────────────

@reports_bp.get("/cash-flow")
def cash_flow():
    db = get_session()
    cid = g.company.id
    receipts = db.query(Voucher).filter_by(company_id=cid, voucher_type="Receipt").all()
    payments = db.query(Voucher).filter_by(company_id=cid, voucher_type="Payment").all()
    sales_total = float(db.query(func.sum(Sale.total)).filter(Sale.company_id == cid).scalar() or 0)
    purchase_total = float(db.query(func.sum(Purchase.total)).filter(Purchase.company_id == cid).scalar() or 0)
    other_in = round(sum(v.total for v in receipts), 2)
    other_out = round(sum(v.total for v in payments), 2)
    total_in = round(sales_total + other_in, 2)
    total_out = round(purchase_total + other_out, 2)
    return jsonify({
        "inflows": [
            {"label": "Sales Collections", "amount": round(sales_total, 2)},
            {"label": "Other Receipts (Vouchers)", "amount": other_in},
        ],
        "outflows": [
            {"label": "Purchase Payments", "amount": round(purchase_total, 2)},
            {"label": "Other Payments (Vouchers)", "amount": other_out},
        ],
        "total_inflow": total_in,
        "total_outflow": total_out,
        "net_cash_flow": round(total_in - total_out, 2),
    })


# ── Low Stock Report ─────────────────────────────────────────────────────────

@reports_bp.get("/low-stock")
def low_stock():
    db = get_session()
    items = db.query(StockItem).filter_by(company_id=g.company.id).all()
    rows = [
        {
            "id": it.id, "name": it.name, "sku": it.sku,
            "quantity": it.quantity or 0,
            "reorder_level": it.reorder_level or 0,
            "shortage": round((it.reorder_level or 0) - (it.quantity or 0), 2),
            "purchase_price": it.purchase_price or 0,
        }
        for it in items if (it.quantity or 0) <= (it.reorder_level or 0)
    ]
    return jsonify({"items": rows, "count": len(rows)})


# ── Item Movement Report ─────────────────────────────────────────────────────

@reports_bp.get("/item-movement")
def item_movement_list():
    db = get_session()
    items = db.query(StockItem).filter_by(company_id=g.company.id).order_by(StockItem.name).all()
    return jsonify([{"id": it.id, "name": it.name, "sku": it.sku, "quantity": it.quantity} for it in items])


@reports_bp.get("/item-movement/<int:item_id>")
def item_movement(item_id):
    db = get_session()
    cid = g.company.id
    item = db.get(StockItem, item_id)
    if not item or item.company_id != cid:
        return jsonify({"error": "Not found"}), 404

    movements = []
    for pi in db.query(PurchaseItem).filter_by(stock_item_id=item_id).all():
        p = db.get(Purchase, pi.purchase_id)
        if p and p.company_id == cid:
            movements.append({"date": p.date.isoformat()[:10], "type": "Purchase In", "ref": p.bill_number, "qty_in": pi.quantity, "qty_out": 0})
    for si in db.query(SaleItem).filter_by(stock_item_id=item_id).all():
        s = db.get(Sale, si.sale_id)
        if s and s.company_id == cid:
            movements.append({"date": s.date.isoformat()[:10], "type": "Sale Out", "ref": s.invoice_number, "qty_in": 0, "qty_out": si.quantity})
    for cni in db.query(CreditNoteItem).filter_by(stock_item_id=item_id).all():
        cn = db.get(CreditNote, cni.note_id)
        if cn and cn.company_id == cid:
            movements.append({"date": cn.date.isoformat()[:10], "type": "Credit Note (Return)", "ref": cn.note_number, "qty_in": cni.quantity, "qty_out": 0})
    for dni in db.query(DebitNoteItem).filter_by(stock_item_id=item_id).all():
        dn = db.get(DebitNote, dni.note_id)
        if dn and dn.company_id == cid:
            movements.append({"date": dn.date.isoformat()[:10], "type": "Debit Note (Return)", "ref": dn.note_number, "qty_in": 0, "qty_out": dni.quantity})

    movements.sort(key=lambda x: x["date"])
    return jsonify({
        "item": item.to_dict(),
        "movements": movements,
        "total_in": sum(m["qty_in"] for m in movements),
        "total_out": sum(m["qty_out"] for m in movements),
        "current_qty": item.quantity or 0,
    })


# ── Customer Statement ───────────────────────────────────────────────────────

@reports_bp.get("/customer-statement")
def all_customers_statement():
    db = get_session()
    rows = db.query(Customer).filter_by(company_id=g.company.id).order_by(Customer.name).all()
    return jsonify([c.to_dict() for c in rows])


@reports_bp.get("/customer-statement/<int:customer_id>")
def customer_statement(customer_id):
    db = get_session()
    cid = g.company.id
    cust = db.get(Customer, customer_id)
    if not cust or cust.company_id != cid:
        return jsonify({"error": "Not found"}), 404
    sales = db.query(Sale).filter_by(company_id=cid, customer_id=customer_id).order_by(Sale.date).all()
    txns = [{"date": s.date.isoformat()[:10], "ref": s.invoice_number, "type": "Invoice", "amount": s.total} for s in sales]
    return jsonify({
        "customer": cust.to_dict(),
        "transactions": txns,
        "total_billed": round(sum(s.total for s in sales), 2),
        "outstanding_balance": cust.outstanding_balance,
    })


# ── Supplier Statement ───────────────────────────────────────────────────────

@reports_bp.get("/supplier-statement")
def all_suppliers_statement():
    db = get_session()
    rows = db.query(Supplier).filter_by(company_id=g.company.id).order_by(Supplier.name).all()
    return jsonify([s.to_dict() for s in rows])


@reports_bp.get("/supplier-statement/<int:supplier_id>")
def supplier_statement(supplier_id):
    db = get_session()
    cid = g.company.id
    sup = db.get(Supplier, supplier_id)
    if not sup or sup.company_id != cid:
        return jsonify({"error": "Not found"}), 404
    purchases = db.query(Purchase).filter_by(company_id=cid, supplier_id=supplier_id).order_by(Purchase.date).all()
    txns = [{"date": p.date.isoformat()[:10], "ref": p.bill_number, "type": "Purchase", "amount": p.total} for p in purchases]
    return jsonify({
        "supplier": sup.to_dict(),
        "transactions": txns,
        "total_purchased": round(sum(p.total for p in purchases), 2),
        "outstanding_dues": sup.outstanding_dues,
    })
