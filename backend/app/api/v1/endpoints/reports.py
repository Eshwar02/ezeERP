from fastapi import APIRouter

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/status")
def status() -> dict[str, str]:
    return {"module": "reports", "state": "stub"}

