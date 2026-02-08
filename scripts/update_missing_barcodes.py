#!/usr/bin/env python3
"""
ListNest Missing Barcode Updater
=================================
Fetches products from Israeli supermarket chains and updates
existing products that are missing barcodes by matching on name.

Flow:
1. Get all products WITHOUT barcodes from Supabase
2. Scrape products WITH barcodes from chains
3. Match by normalized name
4. Update the missing barcodes
"""

import os
import re
import gzip
import json
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from supabase import create_client, Client
from difflib import SequenceMatcher

# ============================================
# Configuration
# ============================================

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

TIMEOUT = 60
HEADERS = {
    'User-Agent': 'ListNest Barcode Updater/1.0',
    'Accept': 'application/xml, text/xml, */*',
    'Accept-Encoding': 'gzip, deflate',
}

# Minimum similarity score for name matching (0-1)
MIN_SIMILARITY = 0.85

# Chain configurations (same as scrape_prices.py)
CHAINS = {
    1: {
        'name': 'שופרסל',
        'name_en': 'Shufersal',
        'type': 'shufersal',
        'base_url': 'https://prices.shufersal.co.il',
    },
    2: {
        'name': 'רמי לוי',
        'name_en': 'Rami Levy',
        'type': 'publishedprices',
        'publisher_id': 'RamiLevi',
    },
    3: {
        'name': 'יינות ביתן',
        'name_en': 'Yeinot Bitan',
        'type': 'publishedprices',
        'publisher_id': 'yeinotbitan',
    },
    4: {
        'name': 'ויקטורי',
        'name_en': 'Victory',
        'type': 'publishedprices',
        'publisher_id': 'Victory',
    },
    5: {
        'name': 'חצי חינם',
        'name_en': 'Hatzi Hinam',
        'type': 'publishedprices',
        'publisher_id': 'HaziHinam',
    },
}


# ============================================
# Helper Functions
# ============================================

def normalize_name(name: str) -> str:
    """Normalize product name for matching."""
    if not name:
        return ""
    # Remove special characters, keep Hebrew letters
    name = re.sub(r'[^\w\s\u0590-\u05FF]', ' ', name)
    # Collapse multiple spaces
    name = re.sub(r'\s+', ' ', name).strip().lower()
    return name


def calculate_similarity(name1: str, name2: str) -> float:
    """Calculate similarity between two names (0-1)."""
    norm1 = normalize_name(name1)
    norm2 = normalize_name(name2)
    return SequenceMatcher(None, norm1, norm2).ratio()


def get_supabase_client() -> Client:
    """Create and return Supabase client."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ============================================
# Supabase Functions
# ============================================

def is_valid_barcode(barcode: str) -> bool:
    """Check if barcode is valid EAN-13/EAN-8 format with correct checksum."""
    if not barcode or not barcode.isdigit():
        return False

    length = len(barcode)

    if length == 13:
        # Validate EAN-13 checksum
        total = sum(int(d) * (1 if i % 2 == 0 else 3) for i, d in enumerate(barcode[:12]))
        check = (10 - (total % 10)) % 10
        return check == int(barcode[12])
    elif length == 8:
        # Validate EAN-8 checksum
        total = sum(int(d) * (3 if i % 2 == 0 else 1) for i, d in enumerate(barcode[:7]))
        check = (10 - (total % 10)) % 10
        return check == int(barcode[7])

    return False


def get_products_without_barcodes(supabase: Client) -> List[dict]:
    """Get all products that don't have barcodes OR have invalid/fake barcodes."""
    try:
        response = supabase.table('products').select('id, name, barcode, category').execute()

        products_needing_update = []
        for p in response.data:
            barcode = p.get('barcode')
            # Include if: no barcode, or barcode is invalid/fake
            if not barcode or not is_valid_barcode(barcode):
                products_needing_update.append(p)

        return products_needing_update
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []


def get_products_with_barcodes(supabase: Client) -> Dict[str, dict]:
    """Get existing products with VALID barcodes to avoid duplicates."""
    try:
        response = supabase.table('products').select('id, barcode, name').not_.is_('barcode', 'null').execute()
        # Only include products with valid barcodes
        return {p['barcode']: p for p in response.data if p.get('barcode') and is_valid_barcode(p['barcode'])}
    except Exception as e:
        print(f"Error fetching products: {e}")
        return {}


def update_product_barcode(supabase: Client, product_id: int, barcode: str) -> bool:
    """Update a product with its barcode."""
    try:
        supabase.table('products').update({
            'barcode': barcode
        }).eq('id', product_id).execute()
        return True
    except Exception as e:
        print(f"Error updating product {product_id}: {e}")
        return False


# ============================================
# XML Parsing (from scrape_prices.py)
# ============================================

def parse_xml_content(content: bytes) -> Optional[ET.Element]:
    """Parse XML content, handling encoding issues."""
    try:
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        try:
            text = content.decode('windows-1255')
        except UnicodeDecodeError:
            text = content.decode('iso-8859-8', errors='replace')

    text = text.lstrip('\ufeff')

    try:
        return ET.fromstring(text)
    except ET.ParseError as e:
        print(f"XML parse error: {e}")
        return None


def extract_items_from_xml(root: ET.Element) -> List[dict]:
    """Extract product items from parsed XML."""
    items = []

    for item in root.findall('.//Item'):
        try:
            item_data = {}

            # Extract barcode (ItemCode)
            barcode_elem = item.find('ItemCode')
            if barcode_elem is not None and barcode_elem.text:
                item_data['barcode'] = barcode_elem.text.strip()

            # Extract name (ItemName)
            name_elem = item.find('ItemName')
            if name_elem is not None and name_elem.text:
                item_data['name'] = name_elem.text.strip()

            # Only add if we have both barcode and name
            if item_data.get('barcode') and item_data.get('name'):
                items.append(item_data)

        except Exception:
            continue

    return items


# ============================================
# Chain Scrapers (simplified from scrape_prices.py)
# ============================================

def fetch_shufersal_products(chain_info: dict) -> List[dict]:
    """Fetch products from Shufersal."""
    products = []
    base_url = chain_info['base_url']

    try:
        list_url = f"{base_url}/FileObject/UpdateCategory?catID=2&storeId=0"
        response = requests.get(list_url, headers=HEADERS, timeout=TIMEOUT)

        if response.status_code != 200:
            print(f"  Failed to get file list: HTTP {response.status_code}")
            return products

        content = response.text
        pattern = r'href="([^"]*PriceFull[^"]*\.gz)"'
        matches = re.findall(pattern, content)

        if not matches:
            print("  No price files found")
            return products

        file_url = matches[0]
        if not file_url.startswith('http'):
            file_url = f"{base_url}{file_url}"

        print(f"  Downloading: {file_url[:80]}...")
        file_response = requests.get(file_url, headers=HEADERS, timeout=TIMEOUT)

        if file_response.status_code == 200:
            try:
                content = gzip.decompress(file_response.content)
            except (OSError, gzip.BadGzipFile):
                content = file_response.content

            root = parse_xml_content(content)
            if root:
                products = extract_items_from_xml(root)

        print(f"  Found {len(products)} products")

    except Exception as e:
        print(f"  Error: {e}")

    return products


def fetch_publishedprices_products(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch products from chains using publishedprices.co.il."""
    products = []
    publisher_id = chain_info.get('publisher_id', '')

    if not publisher_id:
        return products

    try:
        list_url = f"https://url.publishedprices.co.il/file/json/dir/{publisher_id}"
        response = requests.get(list_url, headers=HEADERS, timeout=TIMEOUT)

        if response.status_code != 200:
            print(f"  Failed to get file list: HTTP {response.status_code}")
            return products

        files = response.json()

        # Find latest PriceFull file
        price_files = [f for f in files if 'PriceFull' in f.get('name', '')]

        if not price_files:
            price_files = [f for f in files if 'Prices' in f.get('name', '') and 'Promo' not in f.get('name', '')]

        if not price_files:
            print("  No price files found")
            return products

        latest_file = sorted(price_files, key=lambda x: x.get('name', ''), reverse=True)[0]
        file_name = latest_file['name']
        file_url = f"https://url.publishedprices.co.il/file/d/{publisher_id}/{file_name}"

        print(f"  Downloading: {file_name}")
        file_response = requests.get(file_url, headers=HEADERS, timeout=TIMEOUT)

        if file_response.status_code == 200:
            content = file_response.content

            if file_name.endswith('.gz'):
                try:
                    content = gzip.decompress(content)
                except (OSError, gzip.BadGzipFile):
                    pass  # Use content as-is if decompression fails

            root = parse_xml_content(content)
            if root:
                products = extract_items_from_xml(root)

        print(f"  Found {len(products)} products")

    except json.JSONDecodeError:
        print("  Invalid JSON response")
    except Exception as e:
        print(f"  Error: {e}")

    return products


def scrape_all_products() -> Dict[str, dict]:
    """
    Scrape products from all chains.
    Returns dict: normalized_name -> {barcode, name, sources}
    """
    all_products = {}

    for chain_id, chain_info in CHAINS.items():
        print(f"\n[{chain_id}] {chain_info['name']} ({chain_info['name_en']})")

        chain_type = chain_info.get('type', '')

        if chain_type == 'shufersal':
            products = fetch_shufersal_products(chain_info)
        elif chain_type == 'publishedprices':
            products = fetch_publishedprices_products(chain_id, chain_info)
        else:
            print(f"  Unknown chain type: {chain_type}")
            continue

        # Index by normalized name
        for p in products:
            norm_name = normalize_name(p['name'])
            if norm_name and p.get('barcode'):
                if norm_name not in all_products:
                    all_products[norm_name] = {
                        'barcode': p['barcode'],
                        'name': p['name'],
                        'sources': [chain_info['name']]
                    }
                else:
                    # Add source if same barcode
                    if all_products[norm_name]['barcode'] == p['barcode']:
                        all_products[norm_name]['sources'].append(chain_info['name'])

    return all_products


# ============================================
# Main Logic
# ============================================

def find_best_match(product_name: str, scraped_products: Dict[str, dict], existing_barcodes: set) -> Optional[Tuple[str, dict, float]]:
    """
    Find the best matching product from scraped data.
    Returns: (normalized_name, product_data, similarity_score) or None
    """
    norm_name = normalize_name(product_name)
    best_match = None
    best_score = 0

    for scraped_norm_name, scraped_product in scraped_products.items():
        # Skip if barcode already exists in our database
        if scraped_product['barcode'] in existing_barcodes:
            continue

        # Calculate similarity
        score = SequenceMatcher(None, norm_name, scraped_norm_name).ratio()

        if score > best_score and score >= MIN_SIMILARITY:
            best_score = score
            best_match = (scraped_norm_name, scraped_product, score)

    return best_match


def main():
    """Main entry point."""
    print("=" * 60)
    print("ListNest Missing Barcode Updater")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Initialize Supabase
    try:
        supabase = get_supabase_client()
        print("Connected to Supabase")
    except ValueError as e:
        print(f"Configuration error: {e}")
        return 1
    except Exception as e:
        print(f"Connection error: {e}")
        return 1

    # Get products without barcodes or with invalid barcodes
    print("\nFetching products with missing/invalid barcodes...")
    products_without_barcodes = get_products_without_barcodes(supabase)

    # Categorize
    no_barcode = [p for p in products_without_barcodes if not p.get('barcode')]
    invalid_barcode = [p for p in products_without_barcodes if p.get('barcode')]

    print(f"Found {len(products_without_barcodes)} products needing updates:")
    print(f"  - No barcode: {len(no_barcode)}")
    print(f"  - Invalid/fake barcode: {len(invalid_barcode)}")

    if invalid_barcode:
        print("\nExamples of invalid barcodes:")
        for p in invalid_barcode[:5]:
            print(f"  - {p['name'][:30]}: {p['barcode']}")

    if not products_without_barcodes:
        print("\nNo products need barcode updates!")
        return 0

    # Get existing barcodes to avoid duplicates
    print("\nFetching existing barcodes...")
    existing_products = get_products_with_barcodes(supabase)
    existing_barcodes = set(existing_products.keys())
    print(f"Found {len(existing_barcodes)} existing barcodes")

    # Scrape products from chains
    print("\nScraping products from chains...")
    scraped_products = scrape_all_products()
    print(f"\nTotal unique products scraped: {len(scraped_products)}")

    # Match and update
    print("\n" + "=" * 60)
    print("Matching products...")
    print("=" * 60)

    updated = 0
    not_found = 0
    skipped = 0

    for product in products_without_barcodes:
        product_name = product['name']
        product_id = product['id']

        match = find_best_match(product_name, scraped_products, existing_barcodes)

        if match:
            scraped_norm_name, scraped_data, score = match
            barcode = scraped_data['barcode']
            scraped_name = scraped_data['name']
            sources = ', '.join(scraped_data['sources'][:2])

            print(f"\n✓ Match found (score: {score:.2f})")
            print(f"  DB:     {product_name}")
            print(f"  Scraped: {scraped_name}")
            print(f"  Barcode: {barcode}")
            print(f"  Sources: {sources}")

            if update_product_barcode(supabase, product_id, barcode):
                updated += 1
                # Add to existing to prevent duplicates
                existing_barcodes.add(barcode)
                print(f"  ✅ Updated!")
            else:
                skipped += 1
                print(f"  ❌ Failed to update")
        else:
            not_found += 1
            print(f"\n✗ No match: {product_name}")

    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Products without barcodes: {len(products_without_barcodes)}")
    print(f"Barcodes updated: {updated}")
    print(f"No match found: {not_found}")
    print(f"Skipped/Errors: {skipped}")
    print(f"\nMinimum similarity threshold: {MIN_SIMILARITY}")

    print("\n" + "=" * 60)
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    return 0


if __name__ == '__main__':
    exit(main())
