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

    # Appwrite Storage
    APPWRITE_ENDPOINT = os.environ.get("APPWRITE_ENDPOINT", "https://fra.cloud.appwrite.io/v1")
    APPWRITE_PROJECT = os.environ.get("APPWRITE_PROJECT", "6a3cd70c00252a8a0012")
    APPWRITE_KEY = os.environ.get("APPWRITE_KEY", "standard_d9848a791b38cf68bfda6d2f54722ccb67a8a3763d6cfccbe2ea9451eccf94f269d0cac200bdaa5e5dc79d6425159147e92f21b45ca0e013602ff79e3c642d5ef1f6ef876239420d76f086ae158beaeab188bfa307344a9a5b4c9bb7f355ead1e645d40de60c2ce850f3686647edf2531a39bde509d125e66e45c77f0ac06477")
    APPWRITE_BUCKET = os.environ.get("APPWRITE_BUCKET", "ezeerp-files")
