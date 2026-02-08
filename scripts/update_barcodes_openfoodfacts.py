#!/usr/bin/env python3
"""
ListNest Barcode Updater (Open Food Facts)
==========================================
Updates product barcodes using Open Food Facts API.
This is more reliable than scraping supermarket chains.
"""

import os
import time
import requests
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from difflib import SequenceMatcher
from supabase import create_client, Client

# ============================================
# Configuration
# ============================================

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# Open Food Facts API
OFF_API_BASE = "https://world.openfoodfacts.org/cgi/search.pl"
OFF_TIMEOUT = 30

# Rate limiting (be nice to the API)
REQUEST_DELAY = 1.0  # seconds between requests

# Minimum similarity score for name matching (0-1)
MIN_SIMILARITY = 0.6  # Lower threshold for Hebrew name variations


# ============================================
# Helper Functions
# ============================================

def normalize_name(name: str) -> str:
    """Normalize product name for matching."""
    if not name:
        return ""
    # Remove common words, extra spaces, normalize
    import re
    name = re.sub(r'[^\w\s\u0590-\u05FF]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip().lower()
    # Remove common filler words
    for word in ['גרם', 'מל', 'ליטר', 'יח', 'יחידות', 'קג']:
        name = name.replace(word, '')
    return name.strip()


def calculate_similarity(name1: str, name2: str) -> float:
    """Calculate similarity between two names."""
    norm1 = normalize_name(name1)
    norm2 = normalize_name(name2)
    if not norm1 or not norm2:
        return 0
    return SequenceMatcher(None, norm1, norm2).ratio()


def is_valid_barcode(barcode: str) -> bool:
    """Check if barcode is valid EAN-13/EAN-8 format."""
    if not barcode or not barcode.isdigit():
        return False

    length = len(barcode)

    if length == 13:
        total = sum(int(d) * (1 if i % 2 == 0 else 3) for i, d in enumerate(barcode[:12]))
        check = (10 - (total % 10)) % 10
        return check == int(barcode[12])
    elif length == 8:
        total = sum(int(d) * (3 if i % 2 == 0 else 1) for i, d in enumerate(barcode[:7]))
        check = (10 - (total % 10)) % 10
        return check == int(barcode[7])

    return False


def get_supabase_client() -> Client:
    """Create and return Supabase client."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ============================================
# Open Food Facts API
# ============================================

def search_openfoodfacts(query: str, limit: int = 10) -> List[dict]:
    """Search Open Food Facts for products."""
    try:
        params = {
            'search_terms': query,
            'search_simple': 1,
            'action': 'process',
            'json': 1,
            'countries_tags_en': 'israel',
            'page_size': limit,
            'fields': 'code,product_name,product_name_he,brands,categories'
        }

        response = requests.get(OFF_API_BASE, params=params, timeout=OFF_TIMEOUT)

        if response.status_code == 200:
            data = response.json()
            products = []
            for p in data.get('products', []):
                barcode = p.get('code', '')
                if barcode and is_valid_barcode(barcode):
                    products.append({
                        'barcode': barcode,
                        'name': p.get('product_name_he') or p.get('product_name', ''),
                        'brand': p.get('brands', ''),
                        'category': p.get('categories', '')
                    })
            return products
        else:
            print(f"  API error: {response.status_code}")
            return []

    except requests.RequestException as e:
        print(f"  Request error: {e}")
        return []


def find_best_match(product_name: str, off_products: List[dict]) -> Optional[Tuple[dict, float]]:
    """Find best matching product from Open Food Facts results."""
    best_match = None
    best_score = 0

    for off_product in off_products:
        off_name = off_product.get('name', '')
        if not off_name:
            continue

        score = calculate_similarity(product_name, off_name)

        if score > best_score and score >= MIN_SIMILARITY:
            best_score = score
            best_match = (off_product, score)

    return best_match


# ============================================
# Supabase Functions
# ============================================

def get_products_needing_update(supabase: Client) -> List[dict]:
    """Get products with missing or invalid barcodes."""
    try:
        response = supabase.table('products').select('id, name, barcode, category').execute()

        products_needing_update = []
        for p in response.data:
            barcode = p.get('barcode')
            if not barcode or not is_valid_barcode(barcode):
                products_needing_update.append(p)

        return products_needing_update
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []


def get_existing_valid_barcodes(supabase: Client) -> set:
    """Get all existing valid barcodes to avoid duplicates."""
    try:
        response = supabase.table('products').select('barcode').not_.is_('barcode', 'null').execute()
        return {p['barcode'] for p in response.data if p.get('barcode') and is_valid_barcode(p['barcode'])}
    except Exception as e:
        print(f"Error fetching barcodes: {e}")
        return set()


def update_product_barcode(supabase: Client, product_id: int, barcode: str) -> bool:
    """Update a product with its barcode."""
    try:
        supabase.table('products').update({
            'barcode': barcode
        }).eq('id', product_id).execute()
        return True
    except Exception as e:
        print(f"  Error updating: {e}")
        return False


# ============================================
# Main Logic
# ============================================

def main():
    """Main entry point."""
    print("=" * 60)
    print("ListNest Barcode Updater (Open Food Facts)")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Initialize Supabase
    try:
        supabase = get_supabase_client()
        print("Connected to Supabase")
    except ValueError as e:
        print(f"Configuration error: {e}")
        return 1

    # Get products needing updates
    print("\nFetching products with invalid barcodes...")
    products = get_products_needing_update(supabase)
    print(f"Found {len(products)} products needing updates")

    if not products:
        print("\nNo products need updates!")
        return 0

    # Get existing barcodes
    existing_barcodes = get_existing_valid_barcodes(supabase)
    print(f"Found {len(existing_barcodes)} existing valid barcodes")

    # Process products
    print("\n" + "=" * 60)
    print("Searching Open Food Facts...")
    print("=" * 60)

    updated = 0
    not_found = 0
    skipped = 0

    for i, product in enumerate(products):
        product_name = product['name']
        product_id = product['id']

        # Rate limiting
        if i > 0:
            time.sleep(REQUEST_DELAY)

        print(f"\n[{i+1}/{len(products)}] {product_name[:40]}...")

        # Search Open Food Facts
        results = search_openfoodfacts(product_name)

        if not results:
            print("  No results found")
            not_found += 1
            continue

        # Find best match
        match = find_best_match(product_name, results)

        if match:
            off_product, score = match
            barcode = off_product['barcode']

            # Check if barcode already exists
            if barcode in existing_barcodes:
                print(f"  Barcode {barcode} already in use, skipping")
                skipped += 1
                continue

            print(f"  Match found (score: {score:.2f})")
            print(f"  OFF name: {off_product['name'][:40]}")
            print(f"  Barcode: {barcode}")

            if update_product_barcode(supabase, product_id, barcode):
                updated += 1
                existing_barcodes.add(barcode)
                print("  ✅ Updated!")
            else:
                skipped += 1
        else:
            print(f"  No good match (best results don't match)")
            not_found += 1

        # Progress update
        if (i + 1) % 50 == 0:
            print(f"\n--- Progress: {i+1}/{len(products)} processed, {updated} updated ---\n")

    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Products processed: {len(products)}")
    print(f"Barcodes updated: {updated}")
    print(f"No match found: {not_found}")
    print(f"Skipped: {skipped}")

    print("\n" + "=" * 60)
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    return 0


if __name__ == '__main__':
    exit(main())
