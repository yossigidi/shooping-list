"""
ListNest Price Comparison API - Main Application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.db.database import init_db
from app.api.routes import router as api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    await init_db()
    yield
    # Shutdown
    pass


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ListNest Price Comparison API

    Compare prices from Israeli supermarkets using official government-mandated price data.

    Features:
    - Search products and compare prices across 20+ chains
    - Compare entire shopping lists
    - Optimize shopping baskets for maximum savings
    - Track price history

    Data sources:
    - Israeli Government Price Transparency Law (2015)
    - Updated twice daily from official chain data
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Root endpoint
@app.get("/")
async def root():
    """API root - returns basic info"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "api": settings.API_V1_PREFIX,
        "endpoints": {
            "chains": f"{settings.API_V1_PREFIX}/chains",
            "search": f"{settings.API_V1_PREFIX}/search?q=<query>",
            "product_prices": f"{settings.API_V1_PREFIX}/prices/product/<barcode>",
            "compare_list": f"{settings.API_V1_PREFIX}/compare/list",
            "optimize_basket": f"{settings.API_V1_PREFIX}/optimize/basket",
            "health": f"{settings.API_V1_PREFIX}/health"
        }
    }


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": str(type(exc).__name__)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
