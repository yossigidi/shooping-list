#!/usr/bin/env python3
"""
Product Search Matching Algorithm Test Script

Tests the search matching algorithm by:
1. Fetching all products from Supabase
2. Implementing the same matching logic as the API
3. Testing specific search terms
4. Verifying correct matches and flagging issues
"""

import re
import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import httpx

# Supabase configuration
SUPABASE_URL = "https://uegcgdanmufoilxgxnjm.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZ2NnZGFubXVmb2lseGd4bmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTk2NTcsImV4cCI6MjA4NjA5NTY1N30.vcyH3-ve7ol9t4d16HpAyK8rUSpkZPZwG4pRu6LB2Qs"

@dataclass
class Product:
    """Product data class"""
    id: int
    name: str
    name_normalized: Optional[str]
    barcode: Optional[str]
    category: Optional[str]


@dataclass
class Price:
    """Price data class"""
    product_id: int
    chain_id: int
    price: float
    is_on_sale: bool = False
    sale_price: Optional[float] = None


@dataclass
class Chain:
    """Chain data class"""
    id: int
    name: str
    name_he: str


@dataclass
class SearchResult:
    """Search result with product and price info"""
    product: Product
    prices: List[Dict[str, Any]]
    cheapest_price: Optional[float] = None
    cheapest_chain: Optional[str] = None


class SearchTester:
    """Tests the product search matching algorithm"""

    def __init__(self):
        self.products: List[Product] = []
        self.prices: Dict[int, List[Price]] = {}  # product_id -> prices
        self.chains: Dict[int, Chain] = {}  # chain_id -> chain

    def normalize_product_name(self, name: str) -> str:
        """
        Normalize product name for better matching.
        Same algorithm as in price_service.py
        """
        # Remove special characters, extra spaces (preserve Hebrew)
        name = re.sub(r'[^\w\s\u0590-\u05FF]', ' ', name)
        name = re.sub(r'\s+', ' ', name).strip().lower()
        return name

    def fetch_data(self):
        """Fetch all data from Supabase"""
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }

        print("Fetching data from Supabase...")

        # Fetch products
        print("  - Fetching products...")
        response = httpx.get(
            f"{SUPABASE_URL}/rest/v1/products?select=*",
            headers=headers,
            timeout=30.0
        )
        response.raise_for_status()
        products_data = response.json()
        print(f"    Found {len(products_data)} products")

        self.products = [
            Product(
                id=p["id"],
                name=p.get("name", ""),
                name_normalized=p.get("name_normalized"),
                barcode=p.get("barcode"),
                category=p.get("category")
            )
            for p in products_data
        ]

        # Fetch chains
        print("  - Fetching chains...")
        response = httpx.get(
            f"{SUPABASE_URL}/rest/v1/chains?select=*",
            headers=headers,
            timeout=30.0
        )
        response.raise_for_status()
        chains_data = response.json()
        print(f"    Found {len(chains_data)} chains")

        self.chains = {
            c["id"]: Chain(
                id=c["id"],
                name=c.get("name", ""),
                name_he=c.get("name_he", "")
            )
            for c in chains_data
        }

        # Fetch prices
        print("  - Fetching prices...")
        response = httpx.get(
            f"{SUPABASE_URL}/rest/v1/prices?select=*",
            headers=headers,
            timeout=60.0
        )
        response.raise_for_status()
        prices_data = response.json()
        print(f"    Found {len(prices_data)} prices")

        for p in prices_data:
            product_id = p["product_id"]
            if product_id not in self.prices:
                self.prices[product_id] = []
            self.prices[product_id].append(Price(
                product_id=product_id,
                chain_id=p["chain_id"],
                price=float(p.get("price", 0) or 0),
                is_on_sale=p.get("is_on_sale", False),
                sale_price=float(p["sale_price"]) if p.get("sale_price") else None
            ))

        print("Data fetch complete!\n")

    def analyze_data_quality(self):
        """Analyze and report data quality metrics"""
        print("=" * 80)
        print("DATA QUALITY ANALYSIS")
        print("=" * 80)
        print()

        # Products with prices
        products_with_prices = set(self.prices.keys())
        total_products = len(self.products)
        products_with_prices_count = len(products_with_prices)

        print(f"Total products: {total_products}")
        print(f"Products with at least one price: {products_with_prices_count}")
        print(f"Products without any prices: {total_products - products_with_prices_count}")
        print(f"Data coverage: {products_with_prices_count/total_products*100:.1f}%")
        print()

        # Prices per chain
        print("Prices per chain:")
        chain_price_counts: Dict[int, int] = {}
        for prices_list in self.prices.values():
            for price in prices_list:
                chain_price_counts[price.chain_id] = chain_price_counts.get(price.chain_id, 0) + 1

        for chain_id, count in sorted(chain_price_counts.items(), key=lambda x: -x[1]):
            chain = self.chains.get(chain_id)
            chain_name = chain.name_he if chain else f"Chain {chain_id}"
            print(f"  - {chain_name}: {count} prices")

        print()

        # Categories
        print("Products by category:")
        category_counts: Dict[str, int] = {}
        for product in self.products:
            cat = product.category or "uncategorized"
            category_counts[cat] = category_counts.get(cat, 0) + 1

        for cat, count in sorted(category_counts.items(), key=lambda x: -x[1])[:10]:
            print(f"  - {cat}: {count} products")

        print()

    def search_products(self, query: str, limit: int = 20) -> List[SearchResult]:
        """
        Search for products by name.
        Implements the same matching algorithm as the API.
        """
        normalized_query = self.normalize_product_name(query)
        results = []

        for product in self.products:
            # Check if query matches product name or normalized name
            name_lower = product.name.lower() if product.name else ""
            normalized_name = product.name_normalized.lower() if product.name_normalized else ""

            # Match conditions (same as API: ilike with %query%)
            matches = (
                query.lower() in name_lower or
                normalized_query in name_lower or
                normalized_query in normalized_name or
                (product.barcode and query == product.barcode)
            )

            if matches:
                # Get prices for this product
                product_prices = self.prices.get(product.id, [])

                # Sort by price
                sorted_prices = sorted(product_prices, key=lambda p: p.price)

                # Format prices with chain info
                prices_with_chains = []
                for price in sorted_prices:
                    chain = self.chains.get(price.chain_id)
                    effective_price = price.sale_price if price.is_on_sale and price.sale_price else price.price
                    prices_with_chains.append({
                        "price": price.price,
                        "effective_price": effective_price,
                        "chain_name": chain.name_he if chain else "Unknown",
                        "is_on_sale": price.is_on_sale
                    })

                cheapest_price = sorted_prices[0].price if sorted_prices else None
                cheapest_chain = self.chains.get(sorted_prices[0].chain_id).name_he if sorted_prices and sorted_prices[0].chain_id in self.chains else None

                results.append(SearchResult(
                    product=product,
                    prices=prices_with_chains,
                    cheapest_price=cheapest_price,
                    cheapest_chain=cheapest_chain
                ))

        # Sort by relevance (exact match first, then by number of prices)
        def relevance_score(result: SearchResult) -> tuple:
            name_lower = result.product.name.lower() if result.product.name else ""
            # Exact match gets highest priority
            exact_match = 0 if query.lower() == name_lower else 1
            # Starts with query gets second priority
            starts_with = 0 if name_lower.startswith(query.lower()) else 1
            # Number of prices (more prices = more relevant)
            price_count = -len(result.prices)
            return (exact_match, starts_with, price_count)

        results.sort(key=relevance_score)
        return results[:limit]

    def run_tests(self):
        """Run all search tests"""
        # Define test cases with expected matches
        test_cases = [
            {
                "query": "חלב",
                "expected_keywords": ["חלב", "milk"],
                "description": "should match milk products",
                "price_range": None  # No specific price expectation
            },
            {
                "query": "מטרנה גולד",
                "expected_keywords": ["מטרנה", "גולד", "materna", "gold"],
                "description": "should match Materna Gold formula (~74.90)",
                "price_range": (70, 85),  # Expected around 74.90
                "fallback_query": "מטרנה",  # Fallback if exact query not found
                "fallback_keywords": ["מטרנה"]
            },
            {
                "query": "סימילאק",
                "expected_keywords": ["סימילאק", "similac"],
                "description": "should match Similac formula",
                "price_range": None
            },
            {
                "query": "וודקה",
                "expected_keywords": ["וודקה", "vodka"],
                "description": "should match vodka (~60-80)",
                "price_range": (50, 100)
            },
            {
                "query": "עוף",
                "expected_keywords": ["עוף", "chicken"],
                "description": "should match chicken products",
                "price_range": None
            },
            {
                "query": "במבה",
                "expected_keywords": ["במבה", "bamba"],
                "description": "should match Bamba snacks",
                "price_range": None
            },
            {
                "query": "נייר טואלט",
                "expected_keywords": ["נייר", "טואלט", "toilet", "paper"],
                "description": "should match toilet paper",
                "price_range": None
            },
            {
                "query": "שמפו",
                "expected_keywords": ["שמפו", "shampoo"],
                "description": "should match shampoo",
                "price_range": None
            }
        ]

        print("=" * 80)
        print("PRODUCT SEARCH MATCHING ALGORITHM TEST")
        print("=" * 80)
        print()

        all_passed = True

        for i, test in enumerate(test_cases, 1):
            query = test["query"]
            expected_keywords = test["expected_keywords"]
            description = test["description"]
            price_range = test["price_range"]

            print(f"Test {i}: '{query}' - {description}")
            print("-" * 60)

            results = self.search_products(query, limit=10)

            if not results:
                # Try fallback query if available
                fallback_query = test.get("fallback_query")
                if fallback_query:
                    print(f"  [INFO] No exact results for '{query}', trying fallback '{fallback_query}'...")
                    results = self.search_products(fallback_query, limit=10)
                    expected_keywords = test.get("fallback_keywords", expected_keywords)

                if not results:
                    print(f"  [FAIL] No results found for '{query}'")
                    all_passed = False
                    print()
                    continue

            # Show top 3 matches
            print(f"  Top 3 matches:")
            issues = []

            for j, result in enumerate(results[:3], 1):
                product_name = result.product.name or "N/A"
                category = result.product.category or "N/A"
                cheapest_price = f"{result.cheapest_price:.2f}" if result.cheapest_price else "N/A"
                cheapest_chain = result.cheapest_chain or "N/A"

                # Check if match is relevant (contains expected keywords)
                name_lower = product_name.lower()
                is_relevant = any(kw.lower() in name_lower for kw in expected_keywords)

                status = "[OK]" if is_relevant else "[SUSPICIOUS]"

                print(f"    {j}. {product_name}")
                print(f"       Category: {category}")
                print(f"       Cheapest: {cheapest_price} ILS @ {cheapest_chain}")

                # Show all prices if available
                if result.prices:
                    print(f"       All prices:")
                    for price_info in result.prices[:5]:  # Show up to 5 prices
                        price_str = f"{price_info['price']:.2f} ILS"
                        if price_info.get('is_on_sale'):
                            price_str += " (SALE)"
                        print(f"         - {price_info['chain_name']}: {price_str}")

                if not is_relevant:
                    issues.append(f"Match #{j} '{product_name}' may not be relevant")
                    all_passed = False

                # Check price range if specified
                if price_range and result.cheapest_price:
                    min_price, max_price = price_range
                    if not (min_price <= result.cheapest_price <= max_price):
                        if j == 1:  # Only flag if it's the top match
                            issues.append(f"Price {result.cheapest_price:.2f} outside expected range {min_price}-{max_price}")

                print()

            # Summary for this test
            if issues:
                print(f"  Issues found:")
                for issue in issues:
                    print(f"    - {issue}")
            else:
                print(f"  [PASS] All matches appear correct")

            print()

        # Final summary
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        if all_passed:
            print("[SUCCESS] All search tests passed!")
        else:
            print("[ATTENTION] Some tests may need review - see issues above")

        return all_passed


def main():
    """Main entry point"""
    tester = SearchTester()

    # Fetch all data from Supabase
    tester.fetch_data()

    # Analyze data quality
    tester.analyze_data_quality()

    # Run tests
    tester.run_tests()

    # Print algorithm summary
    print()
    print("=" * 80)
    print("ALGORITHM DETAILS")
    print("=" * 80)
    print()
    print("The search matching algorithm (from price_service.py) works as follows:")
    print()
    print("1. NORMALIZATION:")
    print("   - Removes special characters except Hebrew and alphanumeric")
    print("   - Collapses multiple spaces into single space")
    print("   - Converts to lowercase")
    print()
    print("2. MATCHING (SQL ilike with %query%):")
    print("   - Query matches if it's a substring of product name")
    print("   - Query matches if normalized query is in name or name_normalized")
    print("   - Query matches exactly if it equals the barcode")
    print()
    print("3. SORTING:")
    print("   - Exact matches first")
    print("   - Then matches that start with query")
    print("   - Then by number of available prices (more prices = more relevant)")
    print()
    print("NOTES:")
    print("   - Hebrew text is preserved during normalization")
    print("   - Case-insensitive matching for all text")
    print("   - No fuzzy matching - requires substring match")
    print()


if __name__ == "__main__":
    main()
