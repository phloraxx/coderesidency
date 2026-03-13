"""
CodeResidency FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.routers import auth, users, modules, scenarios, chat, eval

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 CodeResidency Backend starting up...")
    logger.info(f"   Appwrite endpoint: {settings.appwrite_endpoint}")
    logger.info(f"   Redis: {settings.redis_url}")
    logger.info(f"   Gemini API key set: {bool(settings.gemini_api_key)}")
    yield
    logger.info("🛑 CodeResidency Backend shutting down.")


app = FastAPI(
    title="CodeResidency API",
    description="The Clinical Rotation Simulator for Software Engineers",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(modules.router)
app.include_router(scenarios.router)
app.include_router(chat.router)
app.include_router(eval.router)


@app.get("/")
async def root():
    return {
        "name": "CodeResidency API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
