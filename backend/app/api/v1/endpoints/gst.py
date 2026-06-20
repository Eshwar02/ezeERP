from fastapi import APIRouter

router = APIRouter(prefix="/gst", tags=["gst"])


@router.get("/status")
def status() -> dict[str, str]:
    return {"module": "gst", "state": "stub"}

