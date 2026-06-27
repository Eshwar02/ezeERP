"""Accounting routes: double-entry vouchers (Contra, Payment F5, Receipt F6,
Journal F7) and the ledger list used to populate voucher dropdowns.

All scoped to the active company (X-Company-Id header).
"""
from flask import Blueprint, g, jsonify, request

from auth import require_company
from database import get_session
from models import Ledger, Voucher
from services import create_voucher, seed_system_ledgers

accounting_bp = Blueprint("accounting", __name__)


@accounting_bp.before_request
def _guard():
    if request.method == "OPTIONS":
        return None
    return require_company()


@accounting_bp.get("/ledgers")
def list_ledgers():
    db = get_session()
    seed_system_ledgers(db, g.company.id)
    rows = db.query(Ledger).filter_by(company_id=g.company.id).order_by(Ledger.name).all()
    return jsonify([l.to_dict() for l in rows])


@accounting_bp.get("/vouchers")
def list_vouchers():
    db = get_session()
    seed_system_ledgers(db, g.company.id)
    q = db.query(Voucher).filter_by(company_id=g.company.id)
    vtype = request.args.get("type")
    if vtype:
        q = q.filter_by(voucher_type=vtype.title())
    rows = q.order_by(Voucher.id.desc()).all()
    return jsonify([v.to_dict() for v in rows])


@accounting_bp.post("/vouchers")
def add_voucher():
    db = get_session()
    try:
        voucher = create_voucher(db, g.company.id, request.get_json(silent=True) or {})
    except ValueError as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    return jsonify(voucher.to_dict()), 201


@accounting_bp.get("/vouchers/<int:voucher_id>")
def get_voucher(voucher_id):
    db = get_session()
    voucher = db.get(Voucher, voucher_id)
    if not voucher or voucher.company_id != g.company.id:
        return jsonify({"error": "Not found"}), 404
    return jsonify(voucher.to_dict())
