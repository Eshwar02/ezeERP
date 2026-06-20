from fastapi import APIRouter

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/status")
def status() -> dict[str, str]:
    return {"module": "companies", "state": "stub"}

