"""Authentication routes: register & login (email + password -> JWT)."""
from datetime import timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from auth import hash_password, verify_password
from config import Config
from database import get_session
from models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    db = get_session()
    if db.query(User).filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(name=name or email.split("@")[0], email=email, password_hash=hash_password(password))
    db.add(user)
    db.commit()
    token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=Config.JWT_ACCESS_TOKEN_EXPIRES_HOURS),
    )
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    db = get_session()
    user = db.query(User).filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=Config.JWT_ACCESS_TOKEN_EXPIRES_HOURS),
    )
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.get("/me")
@jwt_required()
def me():
    db = get_session()
    user = db.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())
