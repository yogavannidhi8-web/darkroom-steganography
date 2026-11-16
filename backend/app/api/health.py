from fastapi import APIRouter
from app.schemas.responses import HealthResponse
from app.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        version=settings.version,
        environment=settings.app_env,
    )
