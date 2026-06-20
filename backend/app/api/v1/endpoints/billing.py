from fastapi import APIRouter

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/status")
def status() -> dict[str, str]:
    return {"module": "billing", "state": "stub"}

