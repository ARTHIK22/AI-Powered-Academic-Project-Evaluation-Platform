"""
ProjectSense AI - FastAPI Application Entry Point
"""
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import settings
from core.database import create_tables
from api.auth import router as auth_router
from api.student import router as student_router
from api.teacher import router as teacher_router
from api.admin import router as admin_router

# Import all models so SQLAlchemy can register them
import models  # noqa: F401

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("🚀 ProjectSense AI starting up...")
    # Create upload directories
    for subdir in ["reports", "code", "ppts"]:
        os.makedirs(os.path.join(settings.UPLOAD_DIR, subdir), exist_ok=True)
    # Initialize database tables
    await create_tables()
    logger.info("✅ Database tables ready")
    yield
    logger.info("🛑 ProjectSense AI shutting down")


app = FastAPI(
    title="ProjectSense AI",
    description="AI-Powered Academic Project Evaluation Platform",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(teacher_router)
app.include_router(admin_router)


@app.api_route("/", methods=["GET", "HEAD"], tags=["Health"])
async def root():
    return {
        "message": "ProjectSense AI API is running",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.api_route("/api/health", methods=["GET", "HEAD"], tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
