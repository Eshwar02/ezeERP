"""Masters module: ledgers, groups, stock groups, units, stock items,
customers, suppliers. All scoped to the active company (X-Company-Id header).

A small generic CRUD factory keeps the per-entity boilerplate down while still
giving each entity its own REST path.
"""
from flask import Blueprint, g, jsonify, request

from auth import require_company
from database import get_session
from models import (
    Customer,
    Group,
    Ledger,
    StockGroup,
    StockItem,
    Supplier,
    Unit,
)

masters_bp = Blueprint("masters", __name__)


@masters_bp.before_request
def _guard():
    # OPTIONS requests (CORS preflight) must pass through untouched.
    if request.method == "OPTIONS":
        return None
    return require_company()


def register_crud(path, model, fields):
    """Wire list/create/update/delete for a company-scoped model."""

    def _list():
        db = get_session()
        rows = db.query(model).filter_by(company_id=g.company.id).all()
        return jsonify([r.to_dict() for r in rows])

    def _create():
        data = request.get_json(silent=True) or {}
        if not (data.get("name") or "").strip():
            return jsonify({"error": "name is required"}), 400
        db = get_session()
        obj = model(company_id=g.company.id, **{f: data.get(f) for f in fields if f in data})
        db.add(obj)
        db.commit()
        return jsonify(obj.to_dict()), 201

    def _update(item_id):
        db = get_session()
        obj = db.get(model, item_id)
        if not obj or obj.company_id != g.company.id:
            return jsonify({"error": "Not found"}), 404
        data = request.get_json(silent=True) or {}
        for f in fields:
            if f in data:
                setattr(obj, f, data[f])
        db.commit()
        return jsonify(obj.to_dict())

    def _delete(item_id):
        db = get_session()
        obj = db.get(model, item_id)
        if not obj or obj.company_id != g.company.id:
            return jsonify({"error": "Not found"}), 404
        db.delete(obj)
        db.commit()
        return jsonify({"deleted": item_id})

    masters_bp.add_url_rule(f"/{path}", f"{path}_list", _list, methods=["GET"])
    masters_bp.add_url_rule(f"/{path}", f"{path}_create", _create, methods=["POST"])
    masters_bp.add_url_rule(f"/{path}/<int:item_id>", f"{path}_update", _update, methods=["PUT"])
    masters_bp.add_url_rule(f"/{path}/<int:item_id>", f"{path}_delete", _delete, methods=["DELETE"])


register_crud("groups", Group, ["name", "nature"])
register_crud("stock-groups", StockGroup, ["name"])
register_crud("units", Unit, ["name"])


@masters_bp.post("/stock-items/<int:item_id>/adjust")
def adjust_stock(item_id):
    """Manual stock adjustment (Section 8 — Stock Adjustment)."""
    db = get_session()
    item = db.get(StockItem, item_id)
    if not item or item.company_id != g.company.id:
        return jsonify({"error": "Not found"}), 404
    data = request.get_json(silent=True) or {}
    qty_change = float(data.get("qty_change") or 0)
    if qty_change == 0:
        return jsonify({"error": "qty_change cannot be zero"}), 400
    item.quantity = (item.quantity or 0) + qty_change
    db.commit()
    return jsonify({**item.to_dict(), "adjustment": qty_change})
register_crud(
    "ledgers",
    Ledger,
    ["name", "ledger_type", "opening_balance", "balance", "group_id"],
)
register_crud(
    "stock-items",
    StockItem,
    [
        "name", "sku", "hsn_code", "purchase_price", "selling_price",
        "quantity", "gst_percentage", "reorder_level", "stock_group_id", "unit_id",
    ],
)
register_crud(
    "customers",
    Customer,
    ["name", "gst_number", "mobile", "address", "outstanding_balance"],
)
register_crud(
    "suppliers",
    Supplier,
    ["name", "gst_number", "mobile", "address", "outstanding_dues"],
)
