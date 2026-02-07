"""
Price comparison and optimization services
"""
import re
from decimal import Decimal
from typing import List, Optional, Dict, Tuple
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.models import Product, Price, Chain, PriceHistory
from app.models.schemas import (
    ProductPricesResponse, ProductResponse, PriceInfo,
    ListComparisonResponse, ChainComparison, ShoppingListItem,
    BasketOptimizationResponse, OptimizedChainBasket,
    SearchResponse, SearchResult
)


class PriceService:
    """Service for price comparison operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def normalize_product_name(name: str) -> str:
        """Normalize product name for better matching"""
        # Remove special characters, extra spaces
        name = re.sub(r'[^\w\s\u0590-\u05FF]', ' ', name)
        name = re.sub(r'\s+', ' ', name).strip().lower()
        return name

    async def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 20
    ) -> SearchResponse:
        """Search for products by name"""
        normalized_query = self.normalize_product_name(query)

        # Build search query
        stmt = select(Product).where(
            or_(
                Product.name.ilike(f"%{query}%"),
                Product.name_normalized.ilike(f"%{normalized_query}%"),
                Product.barcode == query
            )
        )

        if category:
            stmt = stmt.where(Product.category == category)

        stmt = stmt.limit(limit)
        result = await self.db.execute(stmt)
        products = result.scalars().all()

        # Get cheapest prices for each product
        results = []
        for product in products:
            price_stmt = select(
                Price.price,
                Chain.name_he
            ).join(Chain).where(
                Price.product_id == product.id
            ).order_by(Price.price).limit(1)

            price_result = await self.db.execute(price_stmt)
            price_row = price_result.first()

            results.append(SearchResult(
                product=ProductResponse.model_validate(product),
                cheapest_price=price_row.price if price_row else None,
                cheapest_chain=price_row.name_he if price_row else None,
                price_count=await self._count_prices(product.id)
            ))

        return SearchResponse(
            query=query,
            results=results,
            total_count=len(results)
        )

    async def _count_prices(self, product_id: int) -> int:
        """Count available prices for a product"""
        stmt = select(func.count(Price.id)).where(Price.product_id == product_id)
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def get_product_prices(
        self,
        barcode: Optional[str] = None,
        product_name: Optional[str] = None
    ) -> Optional[ProductPricesResponse]:
        """Get prices for a product from all chains"""
        # Find product
        if barcode:
            stmt = select(Product).where(Product.barcode == barcode)
        elif product_name:
            normalized = self.normalize_product_name(product_name)
            stmt = select(Product).where(
                or_(
                    Product.name.ilike(f"%{product_name}%"),
                    Product.name_normalized.ilike(f"%{normalized}%")
                )
            ).limit(1)
        else:
            return None

        result = await self.db.execute(stmt)
        product = result.scalar_one_or_none()

        if not product:
            return None

        # Get all prices
        prices_stmt = select(Price, Chain).join(Chain).where(
            Price.product_id == product.id
        ).order_by(Price.price)

        prices_result = await self.db.execute(prices_stmt)
        price_rows = prices_result.all()

        if not price_rows:
            return ProductPricesResponse(
                product=ProductResponse.model_validate(product),
                prices=[],
                cheapest=None
            )

        # Build price list
        prices: List[PriceInfo] = []
        min_price = price_rows[0].Price.price if price_rows else None

        for row in price_rows:
            price, chain = row.Price, row.Chain
            effective_price = price.sale_price if price.is_on_sale and price.sale_price else price.price
            is_cheapest = effective_price == min_price

            savings = None
            if not is_cheapest and min_price:
                savings = effective_price - min_price

            prices.append(PriceInfo(
                chain_id=chain.id,
                chain_name=chain.name,
                chain_name_he=chain.name_he,
                price=price.price,
                unit_price=price.unit_price,
                is_on_sale=price.is_on_sale,
                sale_price=price.sale_price,
                promotion=price.promotion_description,
                savings=savings,
                is_cheapest=is_cheapest,
                last_updated=price.last_updated
            ))

        cheapest = prices[0] if prices else None

        return ProductPricesResponse(
            product=ProductResponse.model_validate(product),
            prices=prices,
            cheapest=cheapest,
            price_range={
                "min": min(p.price for p in prices),
                "max": max(p.price for p in prices),
                "avg": sum(p.price for p in prices) / len(prices)
            }
        )

    async def compare_shopping_list(
        self,
        items: List[ShoppingListItem]
    ) -> ListComparisonResponse:
        """Compare prices for a shopping list across all chains"""
        # Get all active chains
        chains_stmt = select(Chain).where(Chain.is_active == True)
        chains_result = await self.db.execute(chains_stmt)
        chains = chains_result.scalars().all()

        chain_totals: Dict[int, ChainComparison] = {}

        for chain in chains:
            chain_totals[chain.id] = ChainComparison(
                chain_id=chain.id,
                chain_name=chain.name,
                chain_name_he=chain.name_he,
                total=Decimal("0"),
                items_found=0,
                items_not_found=[],
                items=[]
            )

        # Process each item
        for item in items:
            product_prices = await self.get_product_prices(product_name=item.name)

            if product_prices and product_prices.prices:
                for price_info in product_prices.prices:
                    if price_info.chain_id in chain_totals:
                        chain_data = chain_totals[price_info.chain_id]
                        item_total = price_info.price * Decimal(str(item.quantity))
                        chain_data.total += item_total
                        chain_data.items_found += 1
                        chain_data.items.append({
                            "name": item.name,
                            "quantity": item.quantity,
                            "price": float(price_info.price),
                            "total": float(item_total)
                        })
            else:
                # Product not found in any chain
                for chain_data in chain_totals.values():
                    chain_data.items_not_found.append(item.name)

        # Filter chains with items and sort by total
        comparisons = sorted(
            [c for c in chain_totals.values() if c.items_found > 0],
            key=lambda x: x.total
        )

        if not comparisons:
            return ListComparisonResponse(
                comparison=[],
                items_analyzed=len(items)
            )

        # Mark cheapest
        comparisons[0].is_cheapest = True
        cheapest = comparisons[0]
        most_expensive = comparisons[-1] if len(comparisons) > 1 else None

        if most_expensive:
            for comp in comparisons:
                comp.savings_vs_expensive = most_expensive.total - comp.total

        return ListComparisonResponse(
            comparison=comparisons,
            cheapest_chain=cheapest,
            most_expensive_chain=most_expensive,
            potential_savings=most_expensive.total - cheapest.total if most_expensive else Decimal("0"),
            items_analyzed=len(items)
        )

    async def optimize_basket(
        self,
        items: List[ShoppingListItem],
        max_chains: int = 2,
        strategy: str = "optimal"
    ) -> BasketOptimizationResponse:
        """
        Optimize shopping basket to minimize cost.

        Strategies:
        - "single": Best single chain for all items
        - "split": Split across chains for lowest price per item
        - "optimal": Balance between savings and convenience (limited chains)
        """
        if strategy == "single":
            return await self._optimize_single_chain(items)
        elif strategy == "split":
            return await self._optimize_split(items)
        else:  # optimal
            return await self._optimize_with_limit(items, max_chains)

    async def _optimize_single_chain(
        self,
        items: List[ShoppingListItem]
    ) -> BasketOptimizationResponse:
        """Find best single chain for all items"""
        comparison = await self.compare_shopping_list(items)

        if not comparison.cheapest_chain:
            return BasketOptimizationResponse(
                strategy="single",
                total_price=Decimal("0"),
                total_savings=Decimal("0"),
                savings_percentage=Decimal("0"),
                shopping_plan=[]
            )

        cheapest = comparison.cheapest_chain
        most_expensive_total = comparison.most_expensive_chain.total if comparison.most_expensive_chain else cheapest.total

        return BasketOptimizationResponse(
            strategy="single",
            total_price=cheapest.total,
            total_savings=most_expensive_total - cheapest.total,
            savings_percentage=((most_expensive_total - cheapest.total) / most_expensive_total * 100) if most_expensive_total > 0 else Decimal("0"),
            shopping_plan=[OptimizedChainBasket(
                chain_id=cheapest.chain_id,
                chain_name=cheapest.chain_name,
                chain_name_he=cheapest.chain_name_he,
                items=cheapest.items,
                subtotal=cheapest.total,
                item_count=cheapest.items_found
            )],
            single_chain_comparison={
                "cheapest": cheapest.chain_name_he,
                "total": float(cheapest.total)
            }
        )

    async def _optimize_split(
        self,
        items: List[ShoppingListItem]
    ) -> BasketOptimizationResponse:
        """Find cheapest price for each item regardless of chain"""
        chain_baskets: Dict[int, Dict] = {}
        total = Decimal("0")
        single_chain_total = Decimal("0")

        for item in items:
            product_prices = await self.get_product_prices(product_name=item.name)

            if product_prices and product_prices.prices:
                # Get cheapest price
                cheapest = product_prices.prices[0]
                item_total = cheapest.price * Decimal(str(item.quantity))
                total += item_total

                # Track for single chain comparison
                single_chain_total += product_prices.prices[-1].price * Decimal(str(item.quantity)) if len(product_prices.prices) > 1 else item_total

                # Add to chain basket
                chain_id = cheapest.chain_id
                if chain_id not in chain_baskets:
                    chain_baskets[chain_id] = {
                        "chain_id": chain_id,
                        "chain_name": cheapest.chain_name,
                        "chain_name_he": cheapest.chain_name_he,
                        "items": [],
                        "subtotal": Decimal("0"),
                        "item_count": 0
                    }

                chain_baskets[chain_id]["items"].append({
                    "name": item.name,
                    "quantity": item.quantity,
                    "price": float(cheapest.price),
                    "total": float(item_total)
                })
                chain_baskets[chain_id]["subtotal"] += item_total
                chain_baskets[chain_id]["item_count"] += 1

        # Convert to response format
        shopping_plan = [
            OptimizedChainBasket(**basket)
            for basket in sorted(chain_baskets.values(), key=lambda x: -x["subtotal"])
        ]

        savings = single_chain_total - total

        return BasketOptimizationResponse(
            strategy="split",
            total_price=total,
            total_savings=savings,
            savings_percentage=(savings / single_chain_total * 100) if single_chain_total > 0 else Decimal("0"),
            shopping_plan=shopping_plan
        )

    async def _optimize_with_limit(
        self,
        items: List[ShoppingListItem],
        max_chains: int
    ) -> BasketOptimizationResponse:
        """Optimize with a limit on number of chains"""
        # First get split optimization
        split_result = await self._optimize_split(items)

        if len(split_result.shopping_plan) <= max_chains:
            split_result.strategy = "optimal"
            return split_result

        # Need to consolidate - use greedy approach
        # Keep top chains by item count and reassign rest
        sorted_chains = sorted(
            split_result.shopping_plan,
            key=lambda x: x.item_count,
            reverse=True
        )

        kept_chains = sorted_chains[:max_chains]
        kept_chain_ids = {c.chain_id for c in kept_chains}

        # Reassign items from removed chains to kept chains
        # For simplicity, assign to cheapest among kept chains
        for removed_chain in sorted_chains[max_chains:]:
            for item_data in removed_chain.items:
                # Find cheapest price among kept chains
                item_name = item_data["name"]
                product_prices = await self.get_product_prices(product_name=item_name)

                if product_prices and product_prices.prices:
                    for price_info in product_prices.prices:
                        if price_info.chain_id in kept_chain_ids:
                            # Add to this chain
                            for kept in kept_chains:
                                if kept.chain_id == price_info.chain_id:
                                    kept.items.append({
                                        "name": item_name,
                                        "quantity": item_data["quantity"],
                                        "price": float(price_info.price),
                                        "total": float(price_info.price * Decimal(str(item_data["quantity"])))
                                    })
                                    kept.subtotal += price_info.price * Decimal(str(item_data["quantity"]))
                                    kept.item_count += 1
                                    break
                            break

        # Recalculate totals
        total = sum(c.subtotal for c in kept_chains)

        # Get single chain comparison
        single = await self._optimize_single_chain(items)
        single_total = single.total_price

        savings = single_total - total if single_total > total else Decimal("0")

        return BasketOptimizationResponse(
            strategy="optimal",
            total_price=total,
            total_savings=savings,
            savings_percentage=(savings / single_total * 100) if single_total > 0 else Decimal("0"),
            shopping_plan=kept_chains,
            single_chain_comparison={
                "cheapest": single.shopping_plan[0].chain_name_he if single.shopping_plan else None,
                "total": float(single_total)
            }
        )

    async def get_price_history(
        self,
        product_id: int,
        chain_id: int,
        days: int = 30
    ) -> List[PriceHistory]:
        """Get price history for a product at a chain"""
        from datetime import datetime, timedelta

        cutoff = datetime.utcnow() - timedelta(days=days)

        stmt = select(PriceHistory).where(
            and_(
                PriceHistory.product_id == product_id,
                PriceHistory.chain_id == chain_id,
                PriceHistory.recorded_at >= cutoff
            )
        ).order_by(PriceHistory.recorded_at)

        result = await self.db.execute(stmt)
        return result.scalars().all()
