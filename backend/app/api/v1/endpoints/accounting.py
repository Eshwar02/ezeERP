from fastapi import APIRouter

router = APIRouter(prefix="/accounting", tags=["accounting"])


@router.get("/status")
def status() -> dict[str, str]:
    return {"module": "accounting", "state": "stub"}

