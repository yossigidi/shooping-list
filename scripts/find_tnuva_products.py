#!/usr/bin/env python3
"""
Find Tnuva Products in Supabase
"""

import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')


def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def find_tnuva():
    print("=" * 70)
    print("Finding Tnuva Products")
    print("=" * 70)

    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase\n")
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # Get ALL products with pagination
    # Supabase has a default limit, so we need to fetch in batches
    all_products = []
    offset = 0
    batch_size = 1000
    while True:
        batch = supabase.table('products').select('id, name, category').range(offset, offset + batch_size - 1).execute()
        if not batch.data:
            break
        all_products.extend(batch.data)
        if len(batch.data) < batch_size:
            break
        offset += batch_size

    all_prices = []
    offset = 0
    while True:
        batch = supabase.table('prices').select('id, product_id, chain_id, price').range(offset, offset + batch_size - 1).execute()
        if not batch.data:
            break
        all_prices.extend(batch.data)
        if len(batch.data) < batch_size:
            break
        offset += batch_size

    chains = supabase.table('chains').select('id, name').execute()

    # Use the fetched data
    class DataWrapper:
        def __init__(self, data):
            self.data = data

    products = DataWrapper(all_products)
    prices = DataWrapper(all_prices)

    chain_names = {c['id']: c['name'] for c in chains.data}

    print(f"Total products in database: {len(products.data)}")
    print(f"Total prices in database: {len(prices.data)}\n")

    # Search for different patterns
    search_terms = ['תנובה', 'חלב 3%', 'חלב 1%', 'חלב דל', 'tnuva']

    for term in search_terms:
        matching = [p for p in products.data if term in p['name'].lower() or term in p['name']]
        print(f"\n🔍 Products containing '{term}': {len(matching)}")
        for p in matching:
            print(f"   - [{p['id']}] {p['name']} ({p.get('category', 'N/A')})")

    # Build price lookup
    price_by_product = {}
    for price in prices.data:
        pid = price['product_id']
        if pid not in price_by_product:
            price_by_product[pid] = []
        price_by_product[pid].append(price)

    # Find specific products mentioned in the API
    print("\n" + "=" * 70)
    print("Looking for specific products from API output:")
    print("=" * 70)

    api_products = [
        'חלב תנובה 3% 1 ליטר',
        'חלב תנובה דל שומן 1 ליטר',
        'חלב תנובה מועשר 2% ב'
    ]

    for name in api_products:
        found = [p for p in products.data if p['name'] == name]
        if found:
            p = found[0]
            print(f"\n✅ Found: {name}")
            print(f"   ID: {p['id']}")
            product_prices = price_by_product.get(p['id'], [])
            if product_prices:
                for pp in product_prices:
                    chain = chain_names.get(pp['chain_id'], 'Unknown')
                    print(f"   Price at {chain}: {pp['price']:.2f}₪")
            else:
                print("   No prices!")
        else:
            # Try partial match
            partial = [p for p in products.data if name in p['name'] or p['name'] in name]
            if partial:
                print(f"\n⚠️  Partial match for '{name}':")
                for p in partial[:5]:
                    print(f"   - [{p['id']}] {p['name']}")
            else:
                print(f"\n❌ Not found: {name}")

    # Show products with very low milk prices
    print("\n" + "=" * 70)
    print("Products with prices between 5-8₪ (potential milk):")
    print("=" * 70)

    for product in products.data:
        product_prices = price_by_product.get(product['id'], [])
        for pp in product_prices:
            if 5 <= pp['price'] <= 8:
                chain = chain_names.get(pp['chain_id'], 'Unknown')
                print(f"   {product['name']}: {pp['price']:.2f}₪ ({chain})")


if __name__ == '__main__':
    find_tnuva()
