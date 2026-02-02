"""SubTracker FastAPI application."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, categories, subscriptions, stats, settings as settings_router, notifications
from app.scheduler import start_scheduler, shutdown_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    shutdown_scheduler()


app = FastAPI(
    title="SubTracker API",
    description="订阅服务管理后端",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
