"""Authentication helpers: password hashing (stdlib) and a current-company guard."""
import hashlib
import hmac
import os

from flask import g, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from database import get_session
from models import Company

_ITERATIONS = 120_000


def hash_password(password: str) -> str:
    """PBKDF2-HMAC-SHA256 using only the stdlib (no external bcrypt dependency)."""
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITERATIONS)
    return f"pbkdf2_sha256${_ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iters, salt_hex, hash_hex = stored.split("$")
        dk = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), int(iters)
        )
        return hmac.compare_digest(dk.hex(), hash_hex)
    except (ValueError, AttributeError):
        return False


def require_company():
    """Resolve the active company from the X-Company-Id header and verify the
    JWT user owns it. Stashes it on flask.g.company. Returns an error response
    tuple if anything fails, otherwise None.
    """
    verify_jwt_in_request()
    user_id = int(get_jwt_identity())
    company_id = request.headers.get("X-Company-Id")
    if not company_id:
        return jsonify({"error": "X-Company-Id header required"}), 400
    db = get_session()
    company = db.get(Company, int(company_id))
    if not company or company.user_id != user_id:
        return jsonify({"error": "Company not found or access denied"}), 403
    g.company = company
    g.user_id = user_id
    return None
