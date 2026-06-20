from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.database import engine
from app.models import AuditLog, Company, Invoice, Ledger, StockItem, User, VoucherEntry  # noqa: F401
from app.models.base import Base

settings = get_settings()

app = FastAPI(title=settings.app_name)
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)

