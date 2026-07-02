"""Reports module (PDF Section 14): Balance Sheet, P&L, Trial Balance,
Stock Summary, Sales, Purchase, and GST reports. All company-scoped.
"""
from flask import Blueprint, g, jsonify, request
from sqlalchemy import func

from auth import require_company
from database import get_session
from models import Customer, Ledger, Purchase, Sale, StockItem, Supplier

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
