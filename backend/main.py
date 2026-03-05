import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from core.config import settings
from database import SessionLocal
from api.v1.router import router as api_v1_router

# ==================== LOGGING ====================
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "module": "%(module)s", "message": "%(message)s"}',
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
logger = logging.getLogger(__name__)

# ==================== RATE LIMITER ====================
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ==================== LIFESPAN ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AgroMarket API starting up")
    yield
    logger.info("AgroMarket API shutting down")


# ==================== APP ====================
app = FastAPI(
    title="AgroMarket API",
    version="1.0.0",
    # Disable interactive docs in production to reduce attack surface
    docs_url=None if settings.PRODUCTION else "/docs",
    redoc_url=None if settings.PRODUCTION else "/redoc",
    lifespan=lifespan,
)

# ==================== MIDDLEWARE ====================
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
)

# ==================== EXCEPTION HANDLERS ====================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
        })
    logger.warning("Validation error on %s: %s", request.url.path, errors)

    if settings.PRODUCTION:
        # In production, return a generic error to avoid leaking field names
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Invalid request data"},
        )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors},
    )


# ==================== ROUTES ====================
app.include_router(api_v1_router)


@app.get("/", tags=["health"])
def root():
    return {"message": "AgroMarket API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health", tags=["health"])
def health_check():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    finally:
        db.close()
    return {"status": "healthy", "database": db_status}
