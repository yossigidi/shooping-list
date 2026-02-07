"""
API routes for ListNest price comparison
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.models import Chain, Product
from app.models.schemas import (
    ProductPricesResponse, ListComparisonRequest, ListComparisonResponse,
    BasketOptimizationRequest, BasketOptimizationResponse,
    SearchRequest, SearchResponse, ChainResponse
)
from app.services.price_service import PriceService

router = APIRouter()


# Health check
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ListNest Price API"}


# Chain endpoints
@router.get("/chains", response_model=List[ChainResponse])
async def get_chains(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Get all supermarket chains"""
    stmt = select(Chain)
    if active_only:
        stmt = stmt.where(Chain.is_active == True)
    stmt = stmt.order_by(Chain.name_he)

    result = await db.execute(stmt)
    chains = result.scalars().all()
    return chains


# Product price endpoints
@router.get("/prices/product/{barcode}", response_model=ProductPricesResponse)
async def get_product_prices_by_barcode(
    barcode: str,
    db: AsyncSession = Depends(get_db)
):
    """Get prices for a product by barcode from all chains"""
    service = PriceService(db)
    result = await service.get_product_prices(barcode=barcode)

    if not result:
        raise HTTPException(status_code=404, detail="Product not found")

    return result


@router.get("/prices/search")
async def search_product_prices(
    q: str = Query(..., min_length=1, max_length=100, description="Product name to search"),
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Search for product prices by name"""
    service = PriceService(db)

    # First search for products
    search_result = await service.search_products(q, category, limit=10)

    if not search_result.results:
        raise HTTPException(status_code=404, detail="No products found")

    # Get full prices for top result
    top_result = search_result.results[0]
    full_prices = await service.get_product_prices(product_name=top_result.product.name)

    return full_prices


# Shopping list comparison
@router.post("/compare/list", response_model=ListComparisonResponse)
async def compare_shopping_list(
    request: ListComparisonRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Compare prices for a shopping list across all chains.

    Returns price comparison showing total cost at each chain,
    which chain is cheapest, and potential savings.
    """
    if not request.items:
        raise HTTPException(status_code=400, detail="Shopping list cannot be empty")

    service = PriceService(db)
    result = await service.compare_shopping_list(request.items)

    return result


# Basket optimization
@router.post("/optimize/basket", response_model=BasketOptimizationResponse)
async def optimize_shopping_basket(
    request: BasketOptimizationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Optimize shopping basket to minimize cost.

    Strategies:
    - "single": Find best single chain for all items
    - "split": Split across chains for lowest price per item (unlimited chains)
    - "optimal": Balance between savings and convenience (limited to max_chains)

    Returns optimized shopping plan with items grouped by chain.
    """
    if not request.items:
        raise HTTPException(status_code=400, detail="Shopping list cannot be empty")

    service = PriceService(db)
    result = await service.optimize_basket(
        items=request.items,
        max_chains=request.max_chains,
        strategy=request.strategy
    )

    return result


# Search endpoint
@router.post("/search", response_model=SearchResponse)
async def search_products(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """Search for products by name"""
    service = PriceService(db)
    return await service.search_products(
        query=request.query,
        category=request.category,
        limit=request.limit
    )


@router.get("/search", response_model=SearchResponse)
async def search_products_get(
    q: str = Query(..., min_length=1, description="Search query"),
    category: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Search for products by name (GET version)"""
    service = PriceService(db)
    return await service.search_products(
        query=q,
        category=category,
        limit=limit
    )


# Statistics endpoint
@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get database statistics"""
    from sqlalchemy import func
    from app.models.models import Product, Price, Chain

    products_count = await db.execute(select(func.count(Product.id)))
    prices_count = await db.execute(select(func.count(Price.id)))
    chains_count = await db.execute(select(func.count(Chain.id)).where(Chain.is_active == True))

    return {
        "products": products_count.scalar() or 0,
        "prices": prices_count.scalar() or 0,
        "active_chains": chains_count.scalar() or 0
    }
