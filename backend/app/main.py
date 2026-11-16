"""
DARKROOM / IMAGE SECURITY LAB
FastAPI backend application entry point.
"""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api import health, capacity, encode, decode, analysis, benchmark

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DARKROOM / Image Security Lab",
    version=settings.version,
    description="Secure Adaptive Image Steganography API",
    docs_url="/api/docs" if settings.app_env == "development" else None,
    redoc_url=None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Exception handler — never expose stack traces to client
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An internal error occurred."}},
    )

# Routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(capacity.router, prefix="/api/v1")
app.include_router(encode.router, prefix="/api/v1")
app.include_router(decode.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(benchmark.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "DARKROOM / Image Security Lab API", "docs": "/api/docs"}
