from fastapi import APIRouter

from app.api.v1.endpoints import accounting, auth, billing, companies, gst, health, inventory, masters, reports

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(companies.router)
api_router.include_router(masters.router)
api_router.include_router(inventory.router)
api_router.include_router(billing.router)
api_router.include_router(accounting.router)
api_router.include_router(gst.router)
api_router.include_router(reports.router)

