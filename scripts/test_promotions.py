#!/usr/bin/env python3
"""
Test script to verify promotions scraping works.
"""

import requests
import re
import gzip
import xml.etree.ElementTree as ET

TIMEOUT = 60
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
}


def extract_promotions_from_xml(root):
    """Extract promotions from parsed Promo XML."""
    promotions = []

    for promo in root.findall('.//Promotion'):
        try:
            promo_data = {}

            # Promotion ID
            promo_id_elem = promo.find('PromotionID')
            if promo_id_elem is not None and promo_id_elem.text:
                promo_data['promo_id'] = promo_id_elem.text.strip()

            # Description
            desc_elem = promo.find('PromotionDescription')
            if desc_elem is not None and desc_elem.text:
                promo_data['description'] = desc_elem.text.strip()

            # Start date
            start_elem = promo.find('PromotionStartDate') or promo.find('PromotionStartDateTime')
            if start_elem is not None and start_elem.text:
                promo_data['start_date'] = start_elem.text.strip()[:10]

            # End date
            end_elem = promo.find('PromotionEndDate') or promo.find('PromotionEndDateTime')
            if end_elem is not None and end_elem.text:
                promo_data['end_date'] = end_elem.text.strip()[:10]

            # Discount info from PromotionItem
            for item in promo.findall('.//PromotionItem'):
                discount_rate = item.find('DiscountRate')
                if discount_rate is not None and discount_rate.text:
                    try:
                        promo_data['discount_rate'] = float(discount_rate.text.strip())
                    except ValueError:
                        pass
                discounted_price = item.find('DiscountedPrice')
                if discounted_price is not None and discounted_price.text:
                    try:
                        promo_data['discounted_price'] = float(discounted_price.text.strip())
                    except ValueError:
                        pass
                min_qty = item.find('MinQty')
                if min_qty is not None and min_qty.text:
                    try:
                        promo_data['min_qty'] = int(min_qty.text.strip())
                    except ValueError:
                        pass
                break  # Just get first item info

            # Get item barcodes
            promo_data['barcodes'] = []
            for item in promo.findall('.//PromotionItem'):
                barcode_elem = item.find('ItemCode')
                if barcode_elem is not None and barcode_elem.text:
                    promo_data['barcodes'].append(barcode_elem.text.strip())

            if promo_data.get('description'):
                promotions.append(promo_data)

        except Exception:
            continue

    return promotions


def test_shufersal_promotions():
    """Test fetching promotions from Shufersal."""
    print("Testing Shufersal Promotions (Fixed Version)")
    print("=" * 60)

    base_url = "https://prices.shufersal.co.il"

    try:
        # Get list of promo files with AJAX header
        list_url = f"{base_url}/FileObject/UpdateCategory?catID=3&storeId=0&iDisplayStart=0&iDisplayLength=20"
        ajax_headers = {**HEADERS, 'X-Requested-With': 'XMLHttpRequest'}

        print(f"Fetching promo file list...")
        response = requests.get(list_url, headers=ajax_headers, timeout=TIMEOUT)
        print(f"Response status: {response.status_code}")

        if response.status_code != 200:
            print(f"Failed to get file list")
            return

        # Find Promo files
        pattern = r'(https://pricesprodpublic\.blob\.core\.windows\.net/promo/Promo[^"<\s]+)'
        matches = re.findall(pattern, response.text)

        if not matches:
            print("No promo files found")
            return

        unique_matches = list(set(matches))[:3]
        print(f"Found {len(unique_matches)} unique promo files")

        all_promotions = []
        seen_promos = set()

        for file_url in unique_matches:
            file_url = file_url.replace('&amp;', '&')
            print(f"\nDownloading: ...{file_url[-60:]}")

            file_response = requests.get(file_url, headers=HEADERS, timeout=TIMEOUT)

            if file_response.status_code == 200:
                try:
                    content = gzip.decompress(file_response.content)
                except (OSError, gzip.BadGzipFile):
                    content = file_response.content

                try:
                    text = content.decode('utf-8')
                except UnicodeDecodeError:
                    text = content.decode('windows-1255', errors='replace')

                text = text.lstrip('\ufeff')

                try:
                    root = ET.fromstring(text)
                    promotions = extract_promotions_from_xml(root)

                    for p in promotions:
                        promo_key = p.get('promo_id', '') + p.get('description', '')
                        if promo_key not in seen_promos:
                            seen_promos.add(promo_key)
                            all_promotions.append(p)

                    print(f"  Parsed {len(promotions)} promotions")

                except ET.ParseError as e:
                    print(f"  XML parse error: {e}")

        print(f"\n" + "=" * 60)
        print(f"✅ Total unique promotions: {len(all_promotions)}")
        print("=" * 60)

        print("\nSample promotions:")
        print("-" * 60)

        for i, promo in enumerate(all_promotions[:15]):
            print(f"\n{i+1}. {promo.get('description', 'N/A')}")
            if promo.get('end_date'):
                print(f"   תוקף עד: {promo['end_date']}")
            if promo.get('discounted_price'):
                print(f"   מחיר מבצע: {promo['discounted_price']}₪")
            if promo.get('min_qty'):
                print(f"   כמות מינימום: {promo['min_qty']}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    test_shufersal_promotions()
