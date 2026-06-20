from fastapi import APIRouter

router = APIRouter(prefix="/masters", tags=["masters"])


@router.get("/status")
def status() -> dict[str, str]:
    return {"module": "masters", "state": "stub"}

