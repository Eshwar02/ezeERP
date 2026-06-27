"""Company management: create / list / alter / delete (max 5 per user)."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from config import Config
from database import get_session
from models import Company
from services import seed_system_ledgers

company_bp = Blueprint("company", __name__)

_FIELDS = ("name", "address", "gst_number", "financial_year", "contact_info", "state")


@company_bp.get("")
@jwt_required()
def list_companies():
    db = get_session()
    rows = db.query(Company).filter_by(user_id=int(get_jwt_identity())).all()
    return jsonify([c.to_dict() for c in rows])


@company_bp.post("")
@jwt_required()
def create_company():
    user_id = int(get_jwt_identity())
    db = get_session()
    count = db.query(Company).filter_by(user_id=user_id).count()
    if count >= Config.MAX_COMPANIES_PER_USER:
        return jsonify({"error": f"Max {Config.MAX_COMPANIES_PER_USER} companies per user"}), 400

    data = request.get_json(silent=True) or {}
    if not (data.get("name") or "").strip():
        return jsonify({"error": "Company name is required"}), 400

    company = Company(user_id=user_id, **{f: data.get(f) for f in _FIELDS})
    db.add(company)
    db.commit()
    seed_system_ledgers(db, company.id)
    return jsonify(company.to_dict()), 201


def _owned(db, company_id, user_id):
    c = db.get(Company, company_id)
    if not c or c.user_id != user_id:
        return None
    return c


@company_bp.put("/<int:company_id>")
@jwt_required()
def alter_company(company_id):
    db = get_session()
    company = _owned(db, company_id, int(get_jwt_identity()))
    if not company:
        return jsonify({"error": "Not found"}), 404
    data = request.get_json(silent=True) or {}
    for f in _FIELDS:
        if f in data:
            setattr(company, f, data[f])
    db.commit()
    return jsonify(company.to_dict())


@company_bp.delete("/<int:company_id>")
@jwt_required()
def delete_company(company_id):
    db = get_session()
    company = _owned(db, company_id, int(get_jwt_identity()))
    if not company:
        return jsonify({"error": "Not found"}), 404
    db.delete(company)
    db.commit()
    return jsonify({"deleted": company_id})
