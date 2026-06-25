"""Configuration for ezeERP backend."""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Config:
    # SQLite for development; swap DATABASE_URL to a postgresql:// URL for production.
    # e.g. postgresql+psycopg2://user:pass@host:5432/ezeerp
    DATABASE_URL = os.environ.get(
        "DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'ezeerp.db')}"
    )
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-change-me-in-production")
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = int(
        os.environ.get("JWT_ACCESS_TOKEN_EXPIRES_HOURS", "12")
    )
    MAX_COMPANIES_PER_USER = 5  # per PDF: "Each user account can manage up to 5 companies."
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
