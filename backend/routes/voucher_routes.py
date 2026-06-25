"""Voucher routes: Sales (F8) and Purchase (F9), plus invoice PDF download."""
from flask import Blueprint, g, jsonify, request, send_file

from auth import require_company
from database import get_session
from models import Customer, Purchase, Sale
from services import create_purchase, create_sale
from utils import build_invoice_pdf

voucher_bp = Blueprint("voucher", __name__)


@voucher_bp.before_request
def _guard():
    if request.method == "OPTIONS":
        return None
    return require_company()


@voucher_bp.get("/sales")
def list_sales():
    db = get_session()
    rows = db.query(Sale).filter_by(company_id=g.company.id).order_by(Sale.id.desc()).all()
    return jsonify([s.to_dict() for s in rows])


@voucher_bp.post("/sales")
def add_sale():
    db = get_session()
    try:
        sale = create_sale(db, g.company.id, request.get_json(silent=True) or {})
    except ValueError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    return jsonify(sale.to_dict()), 201


@voucher_bp.get("/sales/<int:sale_id>/invoice.pdf")
def sale_invoice_pdf(sale_id):
    db = get_session()
    sale = db.get(Sale, sale_id)
    if not sale or sale.company_id != g.company.id:
        return jsonify({"error": "Not found"}), 404
    customer = db.get(Customer, sale.customer_id) if sale.customer_id else None
    pdf = build_invoice_pdf(g.company, customer, sale)
    return send_file(
        pdf,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"{sale.invoice_number}.pdf",
    )


@voucher_bp.get("/purchases")
def list_purchases():
    db = get_session()
    rows = db.query(Purchase).filter_by(company_id=g.company.id).order_by(Purchase.id.desc()).all()
    return jsonify([p.to_dict() for p in rows])


@voucher_bp.post("/purchases")
def add_purchase():
    db = get_session()
    try:
        purchase = create_purchase(db, g.company.id, request.get_json(silent=True) or {})
    except ValueError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    return jsonify(purchase.to_dict()), 201
