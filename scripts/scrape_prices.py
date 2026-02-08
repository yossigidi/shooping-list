#!/usr/bin/env python3
"""
Israeli Supermarket Price Scraper - ListNest
============================================
Fetches prices from official government-mandated price publications.
All Israeli supermarket chains are required by law to publish prices publicly.

Supported chains:
- Shufersal (שופרסל)
- Rami Levy (רמי לוי)
- Yeinot Bitan (יינות ביתן)
- Victory (ויקטורי)
- Hatzi Hinam (חצי חינם)
- Mega (מגה)
- Tiv Taam (טיב טעם)
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
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# Request settings
TIMEOUT = 60
HEADERS = {
    'User-Agent': 'ListNest Price Scraper/1.0',
    'Accept': 'application/xml, text/xml, */*',
    'Accept-Encoding': 'gzip, deflate',
}

# Chain configurations
CHAINS = {
    1: {
        'name': 'שופרסל',
        'name_en': 'Shufersal',
        'type': 'shufersal',
        'base_url': 'http://prices.shufersal.co.il',
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

# Common product barcodes to prioritize
PRIORITY_BARCODES = {
    # חלב מפוקח
    '7290000066318': 'חלב 3% 1 ליטר',
    '7290000066325': 'חלב 1% 1 ליטר',
    # קולה
    '7290000066004': 'קולה 1.5 ליטר',
    '7290000066011': 'קולה זירו 1.5 ליטר',
    '7290000066028': 'קולה 2 ליטר',
    # פפסי
    '7290000066035': 'פפסי 1.5 ליטר',
    # ביצים
    '7290000066042': 'ביצים L 12 יח׳',
}


# ============================================
# Supabase Functions
# ============================================

def get_supabase_client() -> Client:
    """Create and return Supabase client."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def get_existing_products(supabase: Client) -> Dict[str, dict]:
    """Get all existing products from Supabase indexed by barcode."""
    try:
        response = supabase.table('products').select('id, barcode, name').execute()
        return {p['barcode']: p for p in response.data if p.get('barcode')}
    except Exception as e:
        print(f"Error fetching products: {e}")
        return {}


def get_existing_products_by_name(supabase: Client) -> Dict[str, dict]:
    """Get all existing products from Supabase indexed by name."""
    try:
        response = supabase.table('products').select('id, barcode, name').execute()
        return {p['name']: p for p in response.data if p.get('name')}
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
        print(f"Error upserting price: {e}")
        return False


# ============================================
# XML Parsing Functions
# ============================================

def parse_xml_content(content: bytes) -> Optional[ET.Element]:
    """Parse XML content, handling encoding issues."""
    try:
        # Try to decode as UTF-8 first
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        try:
            # Fallback to Windows Hebrew encoding
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

    # Try different XML structures used by various chains
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

        except Exception as e:
            continue

    return items


# ============================================
# Chain-Specific Scrapers
# ============================================

def fetch_shufersal_prices(chain_info: dict) -> List[dict]:
    """Fetch prices from Shufersal."""
    prices = []
    base_url = chain_info['base_url']

    try:
        # Get list of available price files
        list_url = f"{base_url}/FileObject/UpdateCategory?catID=2&storeId=0"
        response = requests.get(list_url, headers=HEADERS, timeout=TIMEOUT)

        if response.status_code != 200:
            print(f"  Failed to get file list: HTTP {response.status_code}")
            return prices

        # Find PriceFull files (contains all prices)
        # Parse HTML to find download links
        content = response.text

        # Look for PriceFull*.gz links
        pattern = r'href="([^"]*PriceFull[^"]*\.gz)"'
        matches = re.findall(pattern, content)

        if not matches:
            print("  No price files found")
            return prices

        # Download and parse the first (latest) file
        file_url = matches[0]
        if not file_url.startswith('http'):
            file_url = f"{base_url}{file_url}"

        print(f"  Downloading: {file_url[:80]}...")
        file_response = requests.get(file_url, headers=HEADERS, timeout=TIMEOUT)

        if file_response.status_code == 200:
            # Decompress gzip
            try:
                content = gzip.decompress(file_response.content)
            except:
                content = file_response.content

            # Parse XML
            root = parse_xml_content(content)
            if root:
                items = extract_items_from_xml(root)
                for item in items:
                    item['chain_id'] = 1
                    prices.append(item)

        print(f"  Found {len(prices)} products")

    except Exception as e:
        print(f"  Error: {e}")

    return prices


def fetch_publishedprices_chain(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch prices from chains using publishedprices.co.il."""
    prices = []
    publisher_id = chain_info.get('publisher_id', '')

    if not publisher_id:
        return prices

    try:
        # Get list of available files
        list_url = f"http://url.publishedprices.co.il/file/json/dir/{publisher_id}"
        response = requests.get(list_url, headers=HEADERS, timeout=TIMEOUT)

        if response.status_code != 200:
            print(f"  Failed to get file list: HTTP {response.status_code}")
            return prices

        files = response.json()

        # Find latest PriceFull file
        price_files = [f for f in files if 'PriceFull' in f.get('name', '')]

        if not price_files:
            # Try Prices file as fallback
            price_files = [f for f in files if 'Prices' in f.get('name', '') and 'Promo' not in f.get('name', '')]

        if not price_files:
            print("  No price files found")
            return prices

        # Sort by name (usually contains date) and get latest
        latest_file = sorted(price_files, key=lambda x: x.get('name', ''), reverse=True)[0]
        file_name = latest_file['name']
        file_url = f"http://url.publishedprices.co.il/file/d/{publisher_id}/{file_name}"

        print(f"  Downloading: {file_name}")
        file_response = requests.get(file_url, headers=HEADERS, timeout=TIMEOUT)

        if file_response.status_code == 200:
            content = file_response.content

            # Decompress if gzipped
            if file_name.endswith('.gz'):
                try:
                    content = gzip.decompress(content)
                except:
                    pass

            # Parse XML
            root = parse_xml_content(content)
            if root:
                items = extract_items_from_xml(root)
                for item in items:
                    item['chain_id'] = chain_id
                    prices.append(item)

        print(f"  Found {len(prices)} products")

    except json.JSONDecodeError:
        print("  Invalid JSON response")
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
        elif chain_type == 'publishedprices':
            prices = fetch_publishedprices_chain(chain_id, chain_info)
        else:
            print(f"  Unknown chain type: {chain_type}")
            continue

        all_prices.extend(prices)

    return all_prices


def update_database(supabase: Client, all_prices: List[dict]) -> Tuple[int, int]:
    """Update Supabase database with scraped prices."""
    if not all_prices:
        return 0, 0

    # Get existing products
    products_by_barcode = get_existing_products(supabase)
    products_by_name = get_existing_products_by_name(supabase)

    updated = 0
    skipped = 0

    for price_data in all_prices:
        barcode = price_data.get('barcode', '')
        name = price_data.get('name', '')
        price = price_data.get('price', 0)
        chain_id = price_data.get('chain_id', 0)

        if not price or price <= 0:
            skipped += 1
            continue

        # Try to find product by barcode first
        product = products_by_barcode.get(barcode)

        # If not found by barcode, try by name (partial match)
        if not product and name:
            # Try exact match first
            product = products_by_name.get(name)

            # Try partial match for common variations
            if not product:
                for prod_name, prod_data in products_by_name.items():
                    if name in prod_name or prod_name in name:
                        product = prod_data
                        break

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
        # Count prices per chain
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
        print("Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set")
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
