from fastapi import APIRouter

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/status")
def status() -> dict[str, str]:
    return {"module": "inventory", "state": "stub"}

