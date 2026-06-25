"""Database engine, session, and base for ezeERP (SQLAlchemy 2.x)."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, scoped_session, sessionmaker

from config import Config


class Base(DeclarativeBase):
    pass


# SQLite needs check_same_thread=False to be used across Flask request threads.
_connect_args = {}
if Config.DATABASE_URL.startswith("sqlite"):
    _connect_args = {"check_same_thread": False}

engine = create_engine(Config.DATABASE_URL, echo=False, future=True, connect_args=_connect_args)
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, expire_on_commit=False))


def get_session():
    """Return the scoped session for the current context."""
    return SessionLocal()


def init_db():
    """Create all tables. Imports models so they register on Base.metadata."""
    import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
