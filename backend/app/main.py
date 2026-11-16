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
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
)

# CORS Security: Restrict strictly to configured allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Production Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    # Upload size safeguard
    content_length = request.headers.get("content-length")
    if content_length:
        max_bytes = settings.max_upload_mb * 1024 * 1024
        try:
            if int(content_length) > max_bytes:
                return JSONResponse(
                    status_code=413,
                    content={"error": {"code": "PAYLOAD_TOO_LARGE", "message": f"Upload exceeds maximum limit of {settings.max_upload_mb} MB."}},
                )
        except ValueError:
            pass

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    return response

# Exception handler — never expose stack traces or internal secrets to client
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
    return {
        "name": "DARKROOM / Image Security Lab API",
        "version": settings.version,
        "environment": settings.app_env,
        "docs": "/api/docs",
        "health": "/api/v1/health",
    }
