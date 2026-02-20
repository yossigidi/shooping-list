#!/usr/bin/env python3
"""
Israeli Supermarket Price Scraper - ListNest
============================================
Fetches prices from official government-mandated price publications.
All Israeli supermarket chains are required by law to publish prices publicly.

Updated February 2026 to work with current API structures.
Supports: Shufersal, Rami Levy, Yeinot Bitan, Victory, Hatzi Hinam
"""

import os
import re
import gzip
import json
import requests
import urllib3
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from supabase import create_client, Client

# Disable SSL warnings for sites with certificate issues (Rami Levy)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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
    # IDs must match database
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
        'username': 'RamiLevi',
    },
    3: {
        'name': 'ויקטורי',
        'name_en': 'Victory',
        'type': 'victory',
        'base_url': 'https://laibcatalog.co.il',
        'chain_ids': ['7290696200003'],
    },
    5: {
        'name': 'חצי חינם',
        'name_en': 'Hatzi Hinam',
        'type': 'hazihinam',
        'base_url': 'https://shop.hazi-hinam.co.il/Prices',
        'blob_base': 'https://hazihinamprod01.blob.core.windows.net/regulatories/',
    },
    6: {
        'name': 'קארפור',
        'name_en': 'Carrefour',
        'type': 'carrefour',
        'base_url': 'https://prices.carrefour.co.il',
    },
    7: {
        'name': 'יוחננוף',
        'name_en': 'Yochananof',
        'type': 'cerberus',
        'username': 'yohananof',
    },
    8: {
        'name': 'אושר עד',
        'name_en': 'Osher Ad',
        'type': 'cerberus',
        'username': 'osherad',
    },
    9: {
        'name': 'טיב טעם',
        'name_en': 'Tiv Taam',
        'type': 'cerberus',
        'username': 'TivTaam',
    },
    10: {
        'name': 'דור אלון',
        'name_en': 'Dor Alon',
        'type': 'cerberus',
        'username': 'doralon',
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

def _find_elem(parent: ET.Element, *names: str) -> Optional[ET.Element]:
    """Find first matching element by trying multiple tag names (case variations)."""
    for name in names:
        elem = parent.find(name)
        if elem is not None:
            return elem
    return None


def extract_promotions_from_xml(root: ET.Element) -> List[dict]:
    """Extract promotions from parsed PromoFull XML.
    Handles two formats:
    - Standard: <Promotions><Promotion> with nested <PromotionItems><Item>
    - Victory:  <Sales><Sale> with ItemCode directly in each Sale (grouped by PromotionID)
    """
    promotions = []

    # Standard format: <Promotion> tags
    for promo in root.findall('.//Promotion'):
        try:
            promo_data = {}

            promo_id_elem = _find_elem(promo, 'PromotionId', 'PromotionID')
            if promo_id_elem is not None and promo_id_elem.text:
                promo_data['promo_id'] = promo_id_elem.text.strip()

            desc_elem = promo.find('PromotionDescription')
            if desc_elem is not None and desc_elem.text:
                promo_data['description'] = desc_elem.text.strip()

            start_elem = _find_elem(promo, 'PromotionStartDate', 'PromotionStartDateTime')
            if start_elem is not None and start_elem.text:
                promo_data['start_date'] = start_elem.text.strip()[:10]

            end_elem = _find_elem(promo, 'PromotionEndDate', 'PromotionEndDateTime')
            if end_elem is not None and end_elem.text:
                promo_data['end_date'] = end_elem.text.strip()[:10]

            discount_type_elem = promo.find('DiscountType')
            if discount_type_elem is not None and discount_type_elem.text:
                promo_data['discount_type'] = discount_type_elem.text.strip()

            discount_rate_elem = promo.find('DiscountRate')
            if discount_rate_elem is not None and discount_rate_elem.text:
                try:
                    promo_data['discount_rate'] = float(discount_rate_elem.text.strip())
                except ValueError:
                    pass

            min_qty_elem = promo.find('MinQty')
            if min_qty_elem is not None and min_qty_elem.text:
                try:
                    promo_data['min_qty'] = int(min_qty_elem.text.strip())
                except ValueError:
                    pass

            promo_data['barcodes'] = []
            for item in promo.findall('.//PromotionItem') or promo.findall('.//Item'):
                barcode_elem = item.find('ItemCode')
                if barcode_elem is not None and barcode_elem.text:
                    promo_data['barcodes'].append(barcode_elem.text.strip())

            if promo_data.get('description'):
                promotions.append(promo_data)

        except Exception:
            continue

    # Victory format: <Sales><Sale> tags — each Sale is one item for one promotion
    # Group by PromotionID to collect all barcodes per promotion
    if not promotions:
        sales = root.findall('.//Sale')
        if sales:
            promo_map = {}  # PromotionID -> promo_data
            for sale in sales:
                try:
                    pid_elem = _find_elem(sale, 'PromotionID', 'PromotionId')
                    desc_elem = sale.find('PromotionDescription')
                    # Note: Element with no children is falsy in Python, use 'is None'
                    if pid_elem is None or not pid_elem.text or desc_elem is None or not desc_elem.text:
                        continue

                    pid = pid_elem.text.strip()
                    if pid not in promo_map:
                        promo_data = {
                            'promo_id': pid,
                            'description': desc_elem.text.strip(),
                            'barcodes': [],
                        }
                        start_elem = _find_elem(sale, 'PromotionStartDate', 'PromotionStartDateTime')
                        if start_elem is not None and start_elem.text:
                            promo_data['start_date'] = start_elem.text.strip()[:10]
                        end_elem = _find_elem(sale, 'PromotionEndDate', 'PromotionEndDateTime')
                        if end_elem is not None and end_elem.text:
                            promo_data['end_date'] = end_elem.text.strip()[:10]
                        discount_type_elem = sale.find('DiscountType')
                        if discount_type_elem is not None and discount_type_elem.text:
                            promo_data['discount_type'] = discount_type_elem.text.strip()
                        discount_rate_elem = sale.find('DiscountRate')
                        if discount_rate_elem is not None and discount_rate_elem.text:
                            try:
                                promo_data['discount_rate'] = float(discount_rate_elem.text.strip())
                            except ValueError:
                                pass
                        min_qty_elem = sale.find('MinQty')
                        if min_qty_elem is not None and min_qty_elem.text:
                            try:
                                promo_data['min_qty'] = int(min_qty_elem.text.strip())
                            except ValueError:
                                pass
                        promo_map[pid] = promo_data

                    barcode_elem = sale.find('ItemCode')
                    if barcode_elem is not None and barcode_elem.text:
                        promo_map[pid]['barcodes'].append(barcode_elem.text.strip())

                except Exception:
                    continue

            promotions = [p for p in promo_map.values() if p.get('description')]

    return promotions


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


def extract_items_from_xml(root: ET.Element, item_tag: str = 'Item') -> List[dict]:
    """Extract product items from parsed XML."""
    items = []

    for item in root.findall(f'.//{item_tag}'):
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
        files_to_download = matches[:3]

        for file_url in files_to_download:
            file_url = file_url.replace('&amp;', '&')

            try:
                file_response = requests.get(file_url, headers=HEADERS, timeout=TIMEOUT)

                if file_response.status_code == 200:
                    try:
                        content = gzip.decompress(file_response.content)
                    except (OSError, gzip.BadGzipFile):
                        content = file_response.content

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

        # Remove duplicates
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
# Cerberus Scraper (Rami Levy)
# ============================================

def fetch_cerberus_prices(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch prices from Cerberus-based chains via HTTP API."""
    prices = []
    username = chain_info.get('username', '')

    if not username:
        print("  No username configured")
        return prices

    try:
        session = requests.Session()
        session.headers.update(HEADERS)
        session.verify = False  # Disable SSL verification for Rami Levy

        # Step 1: Get login page and extract CSRF token
        login_page = session.get('https://url.publishedprices.co.il/login', timeout=TIMEOUT)
        if login_page.status_code != 200:
            print(f"  Failed to get login page: HTTP {login_page.status_code}")
            return prices

        csrf_match = re.search(r'csrftoken" content="([^"]+)"', login_page.text)
        if not csrf_match:
            print("  Could not find CSRF token")
            return prices

        csrf = csrf_match.group(1)

        # Step 2: Login
        login_data = {
            'username': username,
            'password': '',
            'csrftoken': csrf
        }
        login_resp = session.post('https://url.publishedprices.co.il/login/user',
                                  data=login_data, timeout=TIMEOUT)

        if '/file' not in login_resp.url:
            print(f"  Login may have failed (redirect: {login_resp.url})")

        # Step 3: Get file page to get new CSRF token
        files_page = session.get('https://url.publishedprices.co.il/file', timeout=TIMEOUT)
        new_csrf_match = re.search(r'csrftoken" content="([^"]+)"', files_page.text)
        if not new_csrf_match:
            print("  Could not find file page CSRF token")
            return prices

        new_csrf = new_csrf_match.group(1)

        # Step 4: Get PriceFull file listing
        api_response = session.post(
            'https://url.publishedprices.co.il/file/json/dir',
            timeout=TIMEOUT,
            headers={
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': new_csrf,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data={
                'sEcho': '1',
                'iDisplayStart': '0',
                'iDisplayLength': '100',
                'csrftoken': new_csrf,
                'sSearch': 'PriceFull'
            }
        )

        if api_response.status_code != 200:
            print(f"  API error: HTTP {api_response.status_code}")
            return prices

        data = api_response.json()
        files_list = data.get('aaData', [])

        if not files_list:
            print(f"  No PriceFull files found")
            return prices

        print(f"  Found {len(files_list)} PriceFull files")

        # Step 5: Download first few files
        files_to_download = files_list[:3]

        for file_info in files_to_download:
            filename = file_info.get('fname', '')
            if not filename:
                continue

            try:
                download_url = f'https://url.publishedprices.co.il/file/d/{filename}'
                download_resp = session.get(download_url, timeout=TIMEOUT)

                if download_resp.status_code == 200 and len(download_resp.content) > 0:
                    try:
                        content = gzip.decompress(download_resp.content)
                    except (OSError, gzip.BadGzipFile):
                        content = download_resp.content

                    root = parse_xml_content(content)
                    if root:
                        items = extract_items_from_xml(root)
                        for item in items:
                            item['chain_id'] = chain_id
                            prices.append(item)
                        print(f"    Parsed {len(items)} products from {filename}")

            except Exception as e:
                print(f"    Error downloading {filename}: {e}")
                continue

        # Remove duplicates
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
# Carrefour/Yeinot Bitan Scraper
# ============================================

def fetch_carrefour_prices(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch prices from Carrefour/Yeinot Bitan."""
    prices = []
    base_url = chain_info['base_url']

    try:
        session = requests.Session()
        session.headers.update(HEADERS)

        resp = session.get(base_url + '/', timeout=TIMEOUT)
        if resp.status_code != 200:
            print(f"  Failed to get page: HTTP {resp.status_code}")
            return prices

        # Extract path and files from JavaScript
        path_match = re.search(r'const\s+path\s*=\s*["\']([^"\']*)["\']', resp.text)
        path = path_match.group(1) if path_match else ''

        files_match = re.search(r'const\s+files\s*=\s*(\[.*?\]);', resp.text, re.DOTALL)
        if not files_match:
            print("  Could not find files list")
            return prices

        files = json.loads(files_match.group(1))
        price_files = [f for f in files if 'PriceFull' in f.get('name', '')]

        if not price_files:
            print("  No PriceFull files found")
            return prices

        print(f"  Found {len(price_files)} PriceFull files")

        # Download first few files
        for file_info in price_files[:3]:
            filename = file_info.get('name', '')
            if not filename:
                continue

            try:
                download_url = f'{base_url}/{path}/{filename}'
                download_resp = session.get(download_url, timeout=TIMEOUT)

                if download_resp.status_code == 200:
                    try:
                        content = gzip.decompress(download_resp.content)
                    except (OSError, gzip.BadGzipFile):
                        content = download_resp.content

                    root = parse_xml_content(content)
                    if root:
                        items = extract_items_from_xml(root)
                        for item in items:
                            item['chain_id'] = chain_id
                            prices.append(item)
                        print(f"    Parsed {len(items)} products from {filename}")

            except Exception as e:
                print(f"    Error downloading {filename}: {e}")
                continue

        # Remove duplicates
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
# Victory Scraper (laibcatalog.co.il)
# ============================================

def fetch_victory_prices(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch prices from Victory via laibcatalog.co.il (Nibit platform)."""
    prices = []
    base_url = chain_info['base_url']
    victory_chain_ids = chain_info.get('chain_ids', ['7290696200003'])

    try:
        session = requests.Session()
        session.headers.update(HEADERS)

        # Try with shorter connect timeout and retries
        for attempt in range(3):
            try:
                resp = session.get(
                    f'{base_url}/NBCompetitionRegulations.aspx',
                    timeout=(30, TIMEOUT),  # (connect_timeout, read_timeout)
                )
                break
            except requests.exceptions.ConnectTimeout:
                if attempt < 2:
                    print(f"  Connection timeout, retry {attempt + 2}/3...")
                    import time
                    time.sleep(5)
                else:
                    print(f"  Failed after 3 attempts (connection timeout)")
                    return prices
            except requests.exceptions.ConnectionError:
                if attempt < 2:
                    print(f"  Connection error, retry {attempt + 2}/3...")
                    import time
                    time.sleep(5)
                else:
                    print(f"  Failed after 3 attempts (connection error)")
                    return prices

        if resp.status_code != 200:
            print(f"  Failed to get page: HTTP {resp.status_code}")
            return prices

        # Extract all file paths from the page (Price and PriceFull)
        content = resp.text
        file_pattern = r'CompetitionRegulationsFiles[^"\'<>\s]+\.xml\.gz'
        all_files = re.findall(file_pattern, content)

        if not all_files:
            print("  No price files found on page")
            return prices

        # Fix path separators and filter for Price files
        all_files = [f.replace('\\', '/') for f in all_files]
        pricefull_files = [f for f in all_files if 'PriceFull' in f]
        price_files = [f for f in all_files if f.startswith('CompetitionRegulationsFiles') and 'Price' in f and 'Promo' not in f]

        # Prefer PriceFull, fall back to Price
        target_files = pricefull_files if pricefull_files else price_files

        # Filter for Victory chain IDs only
        victory_files = [f for f in target_files if any(cid in f for cid in victory_chain_ids)]
        if not victory_files:
            victory_files = target_files  # Use all if chain filter doesn't match

        file_type = 'PriceFull' if pricefull_files else 'Price'
        print(f"  Found {len(victory_files)} {file_type} files")

        # Download first few files
        for file_path in victory_files[:3]:
            try:
                download_url = f'{base_url}/{file_path}'
                download_resp = session.get(download_url, timeout=TIMEOUT)

                if download_resp.status_code == 200 and len(download_resp.content) > 100:
                    try:
                        file_content = gzip.decompress(download_resp.content)
                    except (OSError, gzip.BadGzipFile):
                        file_content = download_resp.content

                    root = parse_xml_content(file_content)
                    if root:
                        # Victory uses both 'Item' and 'Product' tags
                        items = extract_items_from_xml(root)
                        if not items:
                            items = extract_items_from_xml(root, item_tag='Product')
                        for item in items:
                            item['chain_id'] = chain_id
                            prices.append(item)
                        fname = file_path.split('/')[-1]
                        print(f"    Parsed {len(items)} products from {fname}")

            except Exception as e:
                print(f"    Error downloading file: {e}")
                continue

        # Remove duplicates
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
# Hatzi Hinam Scraper
# ============================================

def fetch_hazihinam_prices(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch prices from Hatzi Hinam via Azure Blob Storage."""
    prices = []
    base_url = chain_info['base_url']

    try:
        session = requests.Session()
        session.headers.update(HEADERS)

        # Fetch multiple pages to find PriceFull files
        pricefull_urls = []
        price_urls = []

        for page in range(1, 5):
            try:
                resp = session.get(f'{base_url}?p={page}', timeout=TIMEOUT)
                if resp.status_code != 200:
                    print(f"  Page {page}: HTTP {resp.status_code}")
                    continue

                # Extract Azure blob URLs directly using regex
                blob_urls = re.findall(
                    r'https://hazihinamprod01\.blob\.core\.windows\.net/regulatories/[^"\'<>\s]+\.gz',
                    resp.text
                )

                for url in blob_urls:
                    if 'PriceFull' in url and url not in pricefull_urls:
                        pricefull_urls.append(url)
                    elif 'Price' in url and 'Promo' not in url and 'PriceFull' not in url and url not in price_urls:
                        price_urls.append(url)

                if pricefull_urls:
                    break  # Found PriceFull files, no need for more pages

            except Exception as e:
                print(f"  Error fetching page {page}: {e}")
                continue

        # Prefer PriceFull, fall back to Price
        target_urls = pricefull_urls if pricefull_urls else price_urls
        file_type = 'PriceFull' if pricefull_urls else 'Price'

        if not target_urls:
            print("  No price files found")
            return prices

        print(f"  Found {len(target_urls)} {file_type} files")

        # Download first few files
        for download_url in target_urls[:3]:
            try:
                download_resp = session.get(download_url, timeout=TIMEOUT)
                fname = download_url.split('/')[-1]

                if download_resp.status_code == 200 and len(download_resp.content) > 100:
                    try:
                        content = gzip.decompress(download_resp.content)
                    except (OSError, gzip.BadGzipFile):
                        content = download_resp.content

                    root = parse_xml_content(content)
                    if root:
                        items = extract_items_from_xml(root)
                        for item in items:
                            item['chain_id'] = chain_id
                            prices.append(item)
                        print(f"    Parsed {len(items)} products from {fname}")

            except Exception as e:
                print(f"    Error downloading file: {e}")
                continue

        # Remove duplicates
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
# Promotion Scrapers
# ============================================

def fetch_hazihinam_promotions(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch promotions from Hatzi Hinam via Azure Blob Storage."""
    promotions = []
    base_url = chain_info['base_url']

    try:
        session = requests.Session()
        session.headers.update(HEADERS)

        # Fetch pages to find PromoFull files
        promofull_urls = []
        promo_urls = []
        for page in range(1, 4):
            try:
                resp = session.get(f'{base_url}?p={page}', timeout=TIMEOUT)
                if resp.status_code != 200:
                    continue

                blob_urls = re.findall(
                    r'https://hazihinamprod01\.blob\.core\.windows\.net/regulatories/[^"\'<>\s]+\.gz',
                    resp.text
                )

                for url in blob_urls:
                    if 'PromoFull' in url and url not in promofull_urls:
                        promofull_urls.append(url)
                    elif 'Promo' in url and 'PromoFull' not in url and url not in promo_urls:
                        promo_urls.append(url)

                if promofull_urls:
                    break

            except Exception:
                continue

        # Prefer PromoFull over regular Promo
        target_urls = promofull_urls if promofull_urls else promo_urls

        if not target_urls:
            print("  No promo files found")
            return promotions

        file_type = 'PromoFull' if promofull_urls else 'Promo'
        print(f"  Found {len(target_urls)} {file_type} files")

        # Download files (more for better coverage)
        seen_promos = set()
        for download_url in target_urls[:3]:
            try:
                download_resp = session.get(download_url, timeout=TIMEOUT)
                fname = download_url.split('/')[-1]

                if download_resp.status_code == 200 and len(download_resp.content) > 100:
                    try:
                        content = gzip.decompress(download_resp.content)
                    except (OSError, gzip.BadGzipFile):
                        content = download_resp.content

                    root = parse_xml_content(content)
                    if root:
                        promos = extract_promotions_from_xml(root)
                        new_count = 0
                        for p in promos:
                            promo_key = p.get('promo_id', '') + p.get('description', '')
                            if promo_key not in seen_promos:
                                seen_promos.add(promo_key)
                                p['chain_id'] = chain_id
                                promotions.append(p)
                                new_count += 1
                        print(f"    Parsed {new_count} new promotions from {fname}")

            except Exception as e:
                print(f"    Error downloading file: {e}")

        print(f"  Total unique promotions: {len(promotions)}")
        return promotions

    except Exception as e:
        print(f"  Error: {e}")

    return promotions


def fetch_victory_promotions(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch promotions from Victory via laibcatalog.co.il."""
    promotions = []
    base_url = chain_info['base_url']
    victory_chain_ids = chain_info.get('chain_ids', ['7290696200003'])

    try:
        session = requests.Session()
        session.headers.update(HEADERS)

        for attempt in range(3):
            try:
                resp = session.get(
                    f'{base_url}/NBCompetitionRegulations.aspx',
                    timeout=(30, TIMEOUT),
                )
                break
            except (requests.exceptions.ConnectTimeout, requests.exceptions.ConnectionError):
                if attempt < 2:
                    import time
                    time.sleep(5)
                else:
                    print(f"  Failed after 3 attempts")
                    return promotions

        if resp.status_code != 200:
            print(f"  Failed to get page: HTTP {resp.status_code}")
            return promotions

        # Extract promo file paths — prefer PromoFull over Promo
        file_pattern = r'CompetitionRegulationsFiles[^"\'<>\s]+Promo[^"\'<>\s]+\.xml\.gz'
        all_promo_files = re.findall(file_pattern, resp.text)
        all_promo_files = [f.replace('\\', '/') for f in all_promo_files]

        # Filter for Victory chain IDs only
        victory_promos = [f for f in all_promo_files if any(cid in f for cid in victory_chain_ids)]

        if not victory_promos:
            print("  No Victory promo files found")
            return promotions

        # Prefer PromoFull files
        promofull = [f for f in victory_promos if 'PromoFull' in f]
        target_files = promofull if promofull else victory_promos

        print(f"  Found {len(target_files)} Victory Promo files")

        # Download multiple files for better coverage (different stores)
        seen_promos = set()
        for file_path in target_files[:5]:
            try:
                download_url = f'{base_url}/{file_path}'
                download_resp = session.get(download_url, timeout=TIMEOUT)

                if download_resp.status_code == 200 and len(download_resp.content) > 100:
                    try:
                        content = gzip.decompress(download_resp.content)
                    except (OSError, gzip.BadGzipFile):
                        content = download_resp.content

                    root = parse_xml_content(content)
                    if root:
                        promos = extract_promotions_from_xml(root)
                        new_count = 0
                        for p in promos:
                            promo_key = p.get('promo_id', '') + p.get('description', '')
                            if promo_key not in seen_promos:
                                seen_promos.add(promo_key)
                                p['chain_id'] = chain_id
                                promotions.append(p)
                                new_count += 1
                        fname = file_path.split('/')[-1]
                        print(f"    Parsed {new_count} new promotions from {fname}")

            except Exception as e:
                print(f"    Error downloading file: {e}")

        print(f"  Total unique promotions: {len(promotions)}")
        return promotions

    except Exception as e:
        print(f"  Error: {e}")

    return promotions


def fetch_shufersal_promotions(chain_info: dict) -> List[dict]:
    """Fetch promotions from Shufersal."""
    promotions = []
    base_url = chain_info['base_url']

    try:
        # Get list of available PromoFull files (catID=4 for full promos)
        # Need X-Requested-With header for AJAX response
        list_url = f"{base_url}/FileObject/UpdateCategory?catID=4&storeId=0&iDisplayStart=0&iDisplayLength=50"
        ajax_headers = {**HEADERS, 'X-Requested-With': 'XMLHttpRequest'}
        response = requests.get(list_url, headers=ajax_headers, timeout=TIMEOUT)

        if response.status_code != 200:
            print(f"  Failed to get promo file list: HTTP {response.status_code}")
            return promotions

        # Find PromoFull files (catID=4 has complete promotion data)
        pattern = r'(https://pricesprodpublic\.blob\.core\.windows\.net/promofull/PromoFull[^"<\s]+)'
        matches = re.findall(pattern, response.text)

        if not matches:
            print("  No promo files found")
            return promotions

        # Remove duplicates and limit - get more files for comprehensive coverage
        unique_matches = list(set(matches))[:15]
        print(f"  Found {len(unique_matches)} promo files")

        # Download files
        seen_promos = set()
        for file_url in unique_matches:
            file_url = file_url.replace('&amp;', '&')
            try:
                file_response = requests.get(file_url, headers=HEADERS, timeout=TIMEOUT)

                if file_response.status_code == 200:
                    try:
                        content = gzip.decompress(file_response.content)
                    except (OSError, gzip.BadGzipFile):
                        content = file_response.content

                    root = parse_xml_content(content)
                    if root:
                        promos = extract_promotions_from_xml(root)
                        for p in promos:
                            # Deduplicate by promo_id
                            promo_key = p.get('promo_id', '') + p.get('description', '')
                            if promo_key not in seen_promos:
                                seen_promos.add(promo_key)
                                p['chain_id'] = 1
                                promotions.append(p)
                        print(f"    Parsed {len(promos)} promotions from file")
            except Exception as e:
                print(f"    Error downloading promo file: {e}")
                continue

        print(f"  Total unique promotions: {len(promotions)}")

    except Exception as e:
        print(f"  Error: {e}")

    return promotions


def fetch_cerberus_promotions(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch promotions from Cerberus-based chains (Rami Levy)."""
    promotions = []
    username = chain_info.get('username', '')

    if not username:
        return promotions

    try:
        session = requests.Session()
        session.headers.update(HEADERS)
        session.verify = False  # Disable SSL verification for Rami Levy

        # Login process (same as price fetching)
        login_page = session.get('https://url.publishedprices.co.il/login', timeout=TIMEOUT)
        if login_page.status_code != 200:
            return promotions

        csrf_match = re.search(r'csrftoken" content="([^"]+)"', login_page.text)
        if not csrf_match:
            return promotions

        csrf = csrf_match.group(1)
        login_data = {'username': username, 'password': '', 'csrftoken': csrf}
        session.post('https://url.publishedprices.co.il/login/user', data=login_data, timeout=TIMEOUT)

        # Get file page for new CSRF
        files_page = session.get('https://url.publishedprices.co.il/file', timeout=TIMEOUT)
        new_csrf_match = re.search(r'csrftoken" content="([^"]+)"', files_page.text)
        if not new_csrf_match:
            return promotions

        new_csrf = new_csrf_match.group(1)

        # Get PromoFull files
        api_response = session.post(
            'https://url.publishedprices.co.il/file/json/dir',
            timeout=TIMEOUT,
            headers={'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': new_csrf},
            data={'sEcho': '1', 'iDisplayStart': '0', 'iDisplayLength': '100',
                  'csrftoken': new_csrf, 'sSearch': 'PromoFull'}
        )

        if api_response.status_code != 200:
            return promotions

        data = api_response.json()
        files_list = data.get('aaData', [])

        if not files_list:
            print(f"  No PromoFull files found")
            return promotions

        print(f"  Found {len(files_list)} PromoFull files")

        # Download first file
        filename = files_list[0].get('fname', '')
        if filename:
            download_url = f'https://url.publishedprices.co.il/file/d/{filename}'
            download_resp = session.get(download_url, timeout=TIMEOUT)

            if download_resp.status_code == 200:
                try:
                    content = gzip.decompress(download_resp.content)
                except (OSError, gzip.BadGzipFile):
                    content = download_resp.content

                root = parse_xml_content(content)
                if root:
                    promos = extract_promotions_from_xml(root)
                    for p in promos:
                        p['chain_id'] = chain_id
                    promotions.extend(promos)
                    print(f"    Parsed {len(promos)} promotions")

    except Exception as e:
        print(f"  Error: {e}")

    return promotions


def fetch_carrefour_promotions(chain_id: int, chain_info: dict) -> List[dict]:
    """Fetch promotions from Carrefour/Yeinot Bitan."""
    promotions = []
    base_url = chain_info['base_url']

    try:
        session = requests.Session()
        session.headers.update(HEADERS)

        resp = session.get(base_url + '/', timeout=TIMEOUT)
        if resp.status_code != 200:
            return promotions

        path_match = re.search(r'const\s+path\s*=\s*["\']([^"\']*)["\']', resp.text)
        path = path_match.group(1) if path_match else ''

        files_match = re.search(r'const\s+files\s*=\s*(\[.*?\]);', resp.text, re.DOTALL)
        if not files_match:
            return promotions

        files = json.loads(files_match.group(1))
        promo_files = [f for f in files if 'PromoFull' in f.get('name', '')]

        if not promo_files:
            print("  No PromoFull files found")
            return promotions

        print(f"  Found {len(promo_files)} PromoFull files")

        # Download first file
        filename = promo_files[0].get('name', '')
        if filename:
            download_url = f'{base_url}/{path}/{filename}'
            download_resp = session.get(download_url, timeout=TIMEOUT)

            if download_resp.status_code == 200:
                try:
                    content = gzip.decompress(download_resp.content)
                except (OSError, gzip.BadGzipFile):
                    content = download_resp.content

                root = parse_xml_content(content)
                if root:
                    promos = extract_promotions_from_xml(root)
                    for p in promos:
                        p['chain_id'] = chain_id
                    promotions.extend(promos)
                    print(f"    Parsed {len(promos)} promotions")

    except Exception as e:
        print(f"  Error: {e}")

    return promotions


def scrape_all_promotions() -> List[dict]:
    """Scrape promotions from all configured chains."""
    all_promotions = []

    for chain_id, chain_info in CHAINS.items():
        print(f"\n[Promos {chain_id}] {chain_info['name']}")

        chain_type = chain_info.get('type', '')

        try:
            if chain_type == 'shufersal':
                promos = fetch_shufersal_promotions(chain_info)
            elif chain_type == 'cerberus':
                promos = fetch_cerberus_promotions(chain_id, chain_info)
            elif chain_type == 'carrefour':
                promos = fetch_carrefour_promotions(chain_id, chain_info)
            elif chain_type == 'hazihinam':
                promos = fetch_hazihinam_promotions(chain_id, chain_info)
            elif chain_type == 'victory':
                promos = fetch_victory_promotions(chain_id, chain_info)
            else:
                print(f"  Promotions not supported for this chain type")
                continue

            all_promotions.extend(promos)
        except Exception as e:
            print(f"  Error scraping promotions: {e}")

    return all_promotions


def update_promotions_database(supabase: Client, promotions: List[dict]) -> Tuple[int, int]:
    """Update Supabase with scraped promotions."""
    if not promotions:
        return 0, 0

    # Get existing products by barcode for linking
    products_by_barcode = get_existing_products(supabase)

    updated = 0
    skipped = 0

    # Clear old promotions
    try:
        supabase.table('promotions').delete().neq('id', 0).execute()
    except Exception:
        pass  # Table may not exist yet

    for promo in promotions:
        try:
            # Find product IDs for barcodes in this promotion
            product_ids = []
            for barcode in promo.get('barcodes', []):
                if barcode in products_by_barcode:
                    product_ids.append(products_by_barcode[barcode]['id'])

            promo_record = {
                'chain_id': promo.get('chain_id'),
                'promo_id': promo.get('promo_id', ''),
                'description': promo.get('description', ''),
                'start_date': promo.get('start_date'),
                'end_date': promo.get('end_date'),
                'discount_type': promo.get('discount_type'),
                'discount_rate': promo.get('discount_rate'),
                'min_qty': promo.get('min_qty'),
                'product_ids': product_ids[:10] if product_ids else None,  # Limit to 10
            }

            supabase.table('promotions').insert(promo_record).execute()
            updated += 1

        except Exception as e:
            skipped += 1

    return updated, skipped


# ============================================
# Main Scraper Logic
# ============================================

def scrape_all_chains() -> List[dict]:
    """Scrape prices from all configured chains."""
    all_prices = []

    for chain_id, chain_info in CHAINS.items():
        print(f"\n[{chain_id}] {chain_info['name']} ({chain_info['name_en']})")

        chain_type = chain_info.get('type', '')

        try:
            if chain_type == 'shufersal':
                prices = fetch_shufersal_prices(chain_info)
            elif chain_type == 'cerberus':
                prices = fetch_cerberus_prices(chain_id, chain_info)
            elif chain_type == 'carrefour':
                prices = fetch_carrefour_prices(chain_id, chain_info)
            elif chain_type == 'victory':
                prices = fetch_victory_prices(chain_id, chain_info)
            elif chain_type == 'hazihinam':
                prices = fetch_hazihinam_prices(chain_id, chain_info)
            else:
                print(f"  Unknown chain type: {chain_type}")
                continue

            all_prices.extend(prices)
        except Exception as e:
            print(f"  Error scraping chain: {e}")

    return all_prices


def is_gluten_free_product(name: str) -> bool:
    """Check if product is gluten-free based on name."""
    if not name:
        return False
    name_lower = name.lower()
    gluten_free_keywords = ['גלוטן', 'gluten', 'ללא גלוטן', 'gluten free', 'gluten-free', 'שר ', 'schar', 'schär']
    return any(kw in name_lower for kw in gluten_free_keywords)


def create_product(supabase: Client, barcode: str, name: str, category: str = 'glutenFree') -> Optional[int]:
    """Create a new product in the database and return its ID."""
    try:
        response = supabase.table('products').insert({
            'barcode': barcode,
            'name': name,
            'category': category,
        }).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]['id']
    except Exception as e:
        print(f"    Error creating product {name}: {e}")
    return None


def ensure_chains_exist(supabase: Client):
    """Ensure all configured chains exist in the database."""
    try:
        existing = supabase.table('chains').select('id, name').execute()
        existing_ids = {c['id'] for c in (existing.data or [])}

        for chain_id, chain_info in CHAINS.items():
            if chain_id not in existing_ids:
                print(f"  Adding missing chain: {chain_info['name']} (ID: {chain_id})")
                supabase.table('chains').insert({
                    'id': chain_id,
                    'code': chain_info.get('name_en', '').lower().replace(' ', '_'),
                    'name': chain_info.get('name_en', ''),
                    'name_he': chain_info['name'],
                    'is_active': True,
                }).execute()
    except Exception as e:
        print(f"  Error ensuring chains: {e}")


def update_database(supabase: Client, all_prices: List[dict]) -> Tuple[int, int]:
    """Update Supabase database with scraped prices."""
    if not all_prices:
        return 0, 0

    # Get existing products by barcode
    products_by_barcode = get_existing_products(supabase)
    print(f"\nFound {len(products_by_barcode)} products in database")

    updated = 0
    skipped = 0
    new_gluten_free = 0

    for price_data in all_prices:
        barcode = price_data.get('barcode', '')
        price = price_data.get('price', 0)
        chain_id = price_data.get('chain_id', 0)
        name = price_data.get('name', '')

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
            # Product doesn't exist - check if it's gluten-free and add it
            if is_gluten_free_product(name):
                product_id = create_product(supabase, barcode, name)
                if product_id:
                    # Add to our local cache
                    products_by_barcode[barcode] = {'id': product_id, 'barcode': barcode, 'name': name}
                    if upsert_price(supabase, product_id, chain_id, price):
                        updated += 1
                        new_gluten_free += 1
                        print(f"    Added gluten-free product: {name} ({price}₪)")
                    else:
                        skipped += 1
                else:
                    skipped += 1
            else:
                skipped += 1

    if new_gluten_free > 0:
        print(f"\n  Added {new_gluten_free} new gluten-free products")

    return updated, skipped


def print_summary(supabase: Client):
    """Print summary of current prices in database."""
    try:
        all_prices = []
        offset = 0
        while True:
            response = supabase.table('prices').select('chain_id, price').range(offset, offset + 999).execute()
            if not response.data:
                break
            all_prices.extend(response.data)
            if len(response.data) < 1000:
                break
            offset += 1000

        chain_counts = {}
        chain_totals = {}

        for p in all_prices:
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

    # Ensure all chains exist in DB
    print("\nEnsuring chains exist in database...")
    ensure_chains_exist(supabase)

    # Scrape all chains
    print("\nScraping prices from chains...")
    all_prices = scrape_all_chains()

    print(f"\nTotal scraped: {len(all_prices)} prices")

    # Update database
    if all_prices:
        print("\nUpdating database...")
        updated, skipped = update_database(supabase, all_prices)
        print(f"Updated: {updated}, Skipped: {skipped}")

    # Scrape promotions
    print("\nScraping promotions from chains...")
    all_promotions = scrape_all_promotions()
    print(f"\nTotal scraped: {len(all_promotions)} promotions")

    if all_promotions:
        print("\nUpdating promotions in database...")
        promo_updated, promo_skipped = update_promotions_database(supabase, all_promotions)
        print(f"Promotions - Updated: {promo_updated}, Skipped: {promo_skipped}")

    # Print summary
    print_summary(supabase)

    print("\n" + "=" * 60)
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    return 0


if __name__ == '__main__':
    exit(main())
