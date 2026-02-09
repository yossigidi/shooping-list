#!/usr/bin/env python3
"""
Israeli Supermarket Price Scraper - ListNest
============================================
Fetches prices from official government-mandated price publications.
All Israeli supermarket chains are required by law to publish prices publicly.

Updated February 2026 to work with current API structures.
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

# ============================================
# Configuration
# ============================================

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('SUPABASE_KEY')

# Request settings
TIMEOUT = 120
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
}

# Chain configurations
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
        'type': 'cerberus',
        'login_url': 'https://url.publishedprices.co.il/login',
        'file_url': 'https://url.publishedprices.co.il/file',
        'username': 'RamiLevi',
    },
    3: {
        'name': 'יינות ביתן',
        'name_en': 'Yeinot Bitan',
        'type': 'cerberus',
        'login_url': 'https://url.publishedprices.co.il/login',
        'file_url': 'https://url.publishedprices.co.il/file',
        'username': 'ybitan',
    },
    4: {
        'name': 'ויקטורי',
        'name_en': 'Victory',
        'type': 'cerberus',
        'login_url': 'https://url.publishedprices.co.il/login',
        'file_url': 'https://url.publishedprices.co.il/file',
        'username': 'Victory',
    },
    5: {
        'name': 'חצי חינם',
        'name_en': 'Hatzi Hinam',
        'type': 'cerberus',
        'login_url': 'https://url.publishedprices.co.il/login',
        'file_url': 'https://url.publishedprices.co.il/file',
        'username': 'HaziHinam',
    },
}


# ============================================
# Supabase Functions
# ============================================

def get_supabase_client() -> Client:
    """Create and return Supabase client."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def get_existing_products(supabase: Client) -> Dict[str, dict]:
    """Get all existing products from Supabase indexed by barcode."""
    try:
        all_products = []
        offset = 0
        while True:
            response = supabase.table('products').select('id, barcode, name').range(offset, offset + 999).execute()
            if not response.data:
                break
            all_products.extend(response.data)
            if len(response.data) < 1000:
                break
            offset += 1000
        return {p['barcode']: p for p in all_products if p.get('barcode')}
    except Exception as e:
        print(f"Error fetching products: {e}")
        return {}


def upsert_price(supabase: Client, product_id: int, chain_id: int, price: float) -> bool:
    """Insert or update a price in Supabase."""
    try:
        supabase.table('prices').upsert({
            'product_id': product_id,
            'chain_id': chain_id,
            'price': round(price, 2),
        }, on_conflict='product_id,chain_id').execute()
        return True
    except Exception as e:
        return False


# ============================================
# XML Parsing Functions
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

    # Remove BOM if present
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

            # Extract price (ItemPrice)
            price_elem = item.find('ItemPrice')
            if price_elem is not None and price_elem.text:
                try:
                    item_data['price'] = float(price_elem.text.strip())
                except ValueError:
                    continue

            # Only add if we have barcode and price
            if item_data.get('barcode') and item_data.get('price', 0) > 0:
                items.append(item_data)

        except Exception:
            continue

    return items


# ============================================
# Shufersal Scraper (Azure Blob Storage)
# ============================================

def fetch_shufersal_prices(chain_info: dict) -> List[dict]:
    """Fetch prices from Shufersal using Azure Blob Storage URLs."""
    prices = []
    base_url = chain_info['base_url']

    try:
        # Get list of available price files
        list_url = f"{base_url}/FileObject/UpdateCategory?catID=2&storeId=0"
        response = requests.get(list_url, headers=HEADERS, timeout=TIMEOUT)

        if response.status_code != 200:
            print(f"  Failed to get file list: HTTP {response.status_code}")
            return prices

        # Find Azure Blob Storage URLs for PriceFull files
        content = response.text
        pattern = r'href="(https://pricesprodpublic\.blob\.core\.windows\.net/pricefull/PriceFull[^"]+)"'
        matches = re.findall(pattern, content)

        if not matches:
            print("  No price files found")
            return prices

        print(f"  Found {len(matches)} price files")

        # Download first few files (different stores)
        files_to_download = matches[:3]  # Limit to 3 stores for speed

        for file_url in files_to_download:
            # Unescape HTML entities
            file_url = file_url.replace('&amp;', '&')

            try:
                file_response = requests.get(file_url, headers=HEADERS, timeout=TIMEOUT)

                if file_response.status_code == 200:
                    # Decompress gzip
                    try:
                        content = gzip.decompress(file_response.content)
                    except (OSError, gzip.BadGzipFile):
                        content = file_response.content

                    # Parse XML
                    root = parse_xml_content(content)
                    if root:
                        items = extract_items_from_xml(root)
                        for item in items:
                            item['chain_id'] = 1
                            prices.append(item)
                        print(f"    Parsed {len(items)} products from file")

            except Exception as e:
                print(f"    Error downloading file: {e}")
                continue

        # Remove duplicates (keep first occurrence)
        seen_barcodes = set()
        unique_prices = []
        for p in prices:
            if p['barcode'] not in seen_barcodes:
                seen_barcodes.add(p['barcode'])
                unique_prices.append(p)

        print(f"  Total unique products: {len(unique_prices)}")
        return unique_prices

    except Exception as e:
        print(f"  Error: {e}")

    return prices


# ============================================
# Main Scraper Logic
# ============================================

def scrape_all_chains() -> List[dict]:
    """Scrape prices from all configured chains."""
    all_prices = []

    for chain_id, chain_info in CHAINS.items():
        print(f"\n[{chain_id}] {chain_info['name']} ({chain_info['name_en']})")

        chain_type = chain_info.get('type', '')

        if chain_type == 'shufersal':
            prices = fetch_shufersal_prices(chain_info)
            all_prices.extend(prices)
        elif chain_type == 'cerberus':
            # Cerberus chains require authentication - skip for now
            print(f"  Skipping (requires authentication)")
        else:
            print(f"  Unknown chain type: {chain_type}")

    return all_prices


def update_database(supabase: Client, all_prices: List[dict]) -> Tuple[int, int]:
    """Update Supabase database with scraped prices."""
    if not all_prices:
        return 0, 0

    # Get existing products by barcode
    products_by_barcode = get_existing_products(supabase)
    print(f"\nFound {len(products_by_barcode)} products in database")

    updated = 0
    skipped = 0

    for price_data in all_prices:
        barcode = price_data.get('barcode', '')
        price = price_data.get('price', 0)
        chain_id = price_data.get('chain_id', 0)

        # Skip invalid prices
        if not price or price <= 0 or price > 500:
            skipped += 1
            continue

        # Skip if no barcode
        if not barcode:
            skipped += 1
            continue

        # Match by barcode
        product = products_by_barcode.get(barcode)

        if product:
            if upsert_price(supabase, product['id'], chain_id, price):
                updated += 1
            else:
                skipped += 1
        else:
            skipped += 1

    return updated, skipped


def print_summary(supabase: Client):
    """Print summary of current prices in database."""
    try:
        response = supabase.table('prices').select('chain_id, price').execute()

        chain_counts = {}
        chain_totals = {}

        for p in response.data:
            cid = p['chain_id']
            chain_counts[cid] = chain_counts.get(cid, 0) + 1
            chain_totals[cid] = chain_totals.get(cid, 0) + p['price']

        print("\n" + "=" * 50)
        print("Database Summary:")
        print("=" * 50)

        for chain_id, chain_info in CHAINS.items():
            count = chain_counts.get(chain_id, 0)
            avg = chain_totals.get(chain_id, 0) / count if count > 0 else 0
            print(f"  {chain_info['name']}: {count} prices (avg: {avg:.2f}₪)")

        total = sum(chain_counts.values())
        print(f"\n  Total: {total} prices")

    except Exception as e:
        print(f"Error getting summary: {e}")


# ============================================
# Entry Point
# ============================================

def main():
    """Main entry point."""
    print("=" * 60)
    print("ListNest Price Scraper")
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

    # Scrape all chains
    print("\nScraping prices from chains...")
    all_prices = scrape_all_chains()

    print(f"\nTotal scraped: {len(all_prices)} prices")

    # Update database
    if all_prices:
        print("\nUpdating database...")
        updated, skipped = update_database(supabase, all_prices)
        print(f"Updated: {updated}, Skipped: {skipped}")

    # Print summary
    print_summary(supabase)

    print("\n" + "=" * 60)
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    return 0


if __name__ == '__main__':
    exit(main())
