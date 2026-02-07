"""
Pydantic schemas for API request/response validation
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


# Chain schemas
class ChainBase(BaseModel):
    code: str
    name: str
    name_he: str
    logo_url: Optional[str] = None


class ChainResponse(ChainBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True


# Product schemas
class ProductBase(BaseModel):
    barcode: Optional[str] = None
    name: str
    category: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    name_normalized: Optional[str] = None
    manufacturer: Optional[str] = None
    unit_type: Optional[str] = None
    unit_quantity: Optional[Decimal] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


# Price schemas
class PriceInfo(BaseModel):
    chain_id: int
    chain_name: str
    chain_name_he: str
    price: Decimal
    unit_price: Optional[Decimal] = None
    is_on_sale: bool = False
    sale_price: Optional[Decimal] = None
    promotion: Optional[str] = None
    savings: Optional[Decimal] = None
    is_cheapest: bool = False
    last_updated: datetime

    class Config:
        from_attributes = True


class ProductPricesResponse(BaseModel):
    """Response for single product price comparison"""
    product: ProductResponse
    prices: List[PriceInfo]
    cheapest: Optional[PriceInfo] = None
    price_range: dict = Field(default_factory=dict)


# Shopping list comparison schemas
class ShoppingListItem(BaseModel):
    name: str
    quantity: float = 1.0
    unit: Optional[str] = None
    category: Optional[str] = None


class ChainComparison(BaseModel):
    chain_id: int
    chain_name: str
    chain_name_he: str
    total: Decimal
    items_found: int
    items_not_found: List[str] = []
    items: List[dict] = []
    is_cheapest: bool = False
    savings_vs_expensive: Optional[Decimal] = None


class ListComparisonRequest(BaseModel):
    items: List[ShoppingListItem]


class ListComparisonResponse(BaseModel):
    """Response for shopping list comparison"""
    comparison: List[ChainComparison]
    cheapest_chain: Optional[ChainComparison] = None
    most_expensive_chain: Optional[ChainComparison] = None
    potential_savings: Decimal = Decimal("0")
    items_analyzed: int = 0


# Basket optimization schemas
class OptimizedChainBasket(BaseModel):
    chain_id: int
    chain_name: str
    chain_name_he: str
    items: List[dict]
    subtotal: Decimal
    item_count: int


class BasketOptimizationRequest(BaseModel):
    items: List[ShoppingListItem]
    max_chains: int = Field(default=2, ge=1, le=5)
    strategy: str = Field(default="optimal", pattern="^(optimal|single|split)$")


class BasketOptimizationResponse(BaseModel):
    """Response for optimized basket"""
    strategy: str
    total_price: Decimal
    total_savings: Decimal
    savings_percentage: Decimal
    shopping_plan: List[OptimizedChainBasket]
    single_chain_comparison: Optional[dict] = None


# Search schemas
class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)


class SearchResult(BaseModel):
    product: ProductResponse
    cheapest_price: Optional[Decimal] = None
    cheapest_chain: Optional[str] = None
    price_count: int = 0


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_count: int


# Price history schemas
class PriceHistoryPoint(BaseModel):
    date: datetime
    price: Decimal
    was_on_sale: bool


class PriceHistoryResponse(BaseModel):
    product: ProductResponse
    chain_id: int
    chain_name: str
    history: List[PriceHistoryPoint]
    current_price: Decimal
    lowest_price: Decimal
    highest_price: Decimal
    average_price: Decimal
