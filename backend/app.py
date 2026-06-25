"""ezeERP — Flask application entrypoint.

Tally-inspired Billing, Inventory & Accounting backend.
Run:  python app.py   (or)   flask --app app run
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database import SessionLocal, init_db
from routes import register_blueprints


def create_app():
    app = Flask(__name__)
    app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY

    CORS(
        app,
        resources={r"/api/*": {"origins": Config.CORS_ORIGINS}},
        allow_headers=["Content-Type", "Authorization", "X-Company-Id"],
        supports_credentials=True,
    )
    JWTManager(app)

    init_db()
    register_blueprints(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "app": "ezeERP"})

    @app.teardown_appcontext
    def cleanup(exc=None):
        SessionLocal.remove()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
