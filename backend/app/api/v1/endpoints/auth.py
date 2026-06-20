from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/status")
def status() -> dict[str, str]:
    return {"module": "auth", "state": "stub"}

