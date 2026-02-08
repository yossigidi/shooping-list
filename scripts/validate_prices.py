#!/usr/bin/env python3
"""
ListNest Price Validator
========================
Checks for suspicious prices in the Supabase database.
Compares against expected price ranges.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# Expected price ranges for common products (min, max in NIS)
EXPECTED_PRICES = {
    # Dairy
    'חלב': (5, 12),
    'גבינה': (5, 40),
    'קוטג': (5, 20),
    'שמנת': (4, 15),
    'יוגורט': (3, 15),
    'חמאה': (8, 25),
    'ביצים': (15, 40),

    # Beverages
    'קולה': (5, 50),  # 6-pack can be up to 50
    'פפסי': (5, 50),
    'ספרייט': (5, 50),
    'פאנטה': (5, 50),
    'מים': (3, 30),
    'מיץ': (5, 25),

    # Spreads
    'ממרח': (8, 35),
    'לוטוס': (10, 35),
    'נוטלה': (15, 50),
    'חמאת בוטנים': (15, 40),
    'עוגיות': (5, 25),

    # Bread
    'לחם': (5, 20),
    'פיתות': (5, 15),
    'חלות': (5, 20),

    # Basic groceries
    'אורז': (5, 30),
    'פסטה': (3, 15),
    'שמן': (8, 35),
    'סוכר': (5, 15),
    'קמח': (3, 15),
    'מלח': (2, 8),

    # Snacks
    'ביסלי': (3, 15),
    'במבה': (3, 15),
    'תפוצ\'ון': (3, 15),
    'צ\'יפס': (5, 20),

    # Pantry
    'טחינה': (10, 35),
    'חומוס': (5, 20),
    'רסק עגבניות': (3, 15),
    'תירס': (3, 15),
}

# Maximum reasonable price for any product (sanity check)
MAX_REASONABLE_PRICE = 100  # 100 NIS


def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def validate_prices():
    print("=" * 60)
    print("ListNest Price Validator")
    print("=" * 60)

    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase\n")
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # Get all products with their average prices
    products = supabase.table('products').select('id, name, category').execute()
    prices = supabase.table('prices').select('product_id, chain_id, price').execute()
    chains = supabase.table('chains').select('id, name').execute()

    # Create chain lookup
    chain_names = {c['id']: c['name'] for c in chains.data}

    # Calculate average price per product
    product_prices = {}
    for p in prices.data:
        pid = p['product_id']
        if pid not in product_prices:
            product_prices[pid] = {'prices': [], 'chains': []}
        product_prices[pid]['prices'].append(p['price'])
        product_prices[pid]['chains'].append(p['chain_id'])

    # Find suspicious prices
    suspicious = []
    very_high = []

    for product in products.data:
        pid = product['id']
        name = product['name']

        if pid not in product_prices:
            continue

        avg_price = sum(product_prices[pid]['prices']) / len(product_prices[pid]['prices'])
        max_price = max(product_prices[pid]['prices'])
        min_price = min(product_prices[pid]['prices'])

        # Check against expected ranges
        found_match = False
        for keyword, (exp_min, exp_max) in EXPECTED_PRICES.items():
            if keyword in name:
                found_match = True
                if avg_price < exp_min * 0.5 or avg_price > exp_max * 2:
                    suspicious.append({
                        'name': name,
                        'avg_price': avg_price,
                        'expected': f"{exp_min}-{exp_max}",
                        'keyword': keyword,
                        'chain_prices': list(zip(
                            [chain_names.get(c, c) for c in product_prices[pid]['chains']],
                            product_prices[pid]['prices']
                        ))
                    })
                break

        # Check for very high prices (potential errors)
        if avg_price > MAX_REASONABLE_PRICE:
            very_high.append({
                'name': name,
                'avg_price': avg_price,
                'max_price': max_price,
                'chain_prices': list(zip(
                    [chain_names.get(c, c) for c in product_prices[pid]['chains']],
                    product_prices[pid]['prices']
                ))
            })

    # Report
    print("=" * 60)
    print("🔴 VERY HIGH PRICES (> 100₪ avg) - Likely Errors")
    print("=" * 60)
    if very_high:
        for item in sorted(very_high, key=lambda x: x['avg_price'], reverse=True):
            print(f"\n❌ {item['name']}")
            print(f"   Average: {item['avg_price']:.2f}₪")
            print(f"   Prices by chain:")
            for chain, price in item['chain_prices']:
                print(f"     - {chain}: {price:.2f}₪")
    else:
        print("✅ No extremely high prices found")

    print("\n" + "=" * 60)
    print("🟡 SUSPICIOUS PRICES (outside expected range)")
    print("=" * 60)
    if suspicious:
        for item in suspicious:
            print(f"\n⚠️ {item['name']}")
            print(f"   Average: {item['avg_price']:.2f}₪ (expected: {item['expected']}₪)")
            print(f"   Matched keyword: '{item['keyword']}'")
            print(f"   Prices by chain:")
            for chain, price in item['chain_prices']:
                print(f"     - {chain}: {price:.2f}₪")
    else:
        print("✅ No suspicious prices found")

    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Total products checked: {len(products.data)}")
    print(f"Very high prices found: {len(very_high)}")
    print(f"Suspicious prices found: {len(suspicious)}")

    if very_high or suspicious:
        print("\n💡 To fix these issues:")
        print("   1. Check the product matching in scrape_prices.py")
        print("   2. Or manually update prices in Supabase")
        print("   3. Or delete incorrect price entries and re-run scraper")


if __name__ == '__main__':
    validate_prices()
