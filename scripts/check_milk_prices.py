#!/usr/bin/env python3
"""
Check Milk Prices in Supabase
=============================
Queries the database to see exact product names and prices for milk products.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')


def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def check_milk_prices():
    print("=" * 70)
    print("Milk Products Price Check")
    print("=" * 70)

    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase\n")
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # Get all products
    products = supabase.table('products').select('id, name, category').execute()
    prices = supabase.table('prices').select('id, product_id, chain_id, price').execute()
    chains = supabase.table('chains').select('id, name').execute()

    chain_names = {c['id']: c['name'] for c in chains.data}

    # Find milk products
    milk_keywords = ['חלב', 'milk']
    milk_products = [p for p in products.data if any(kw in p['name'].lower() for kw in milk_keywords)]

    print(f"Found {len(milk_products)} milk products:\n")
    print("-" * 70)

    # Build price lookup
    price_by_product = {}
    for price in prices.data:
        pid = price['product_id']
        if pid not in price_by_product:
            price_by_product[pid] = []
        price_by_product[pid].append(price)

    # Regulated price reference
    REGULATED_PRICE = 7.28

    for product in sorted(milk_products, key=lambda x: x['name']):
        product_id = product['id']
        name = product['name']
        category = product.get('category', 'N/A')

        print(f"\n📦 Product: {name}")
        print(f"   ID: {product_id}")
        print(f"   Category: {category}")

        product_prices = price_by_product.get(product_id, [])
        if product_prices:
            print(f"   Prices ({len(product_prices)} chains):")
            for pp in product_prices:
                chain_name = chain_names.get(pp['chain_id'], 'Unknown')
                price = pp['price']
                status = ""

                # Check if Tnuva milk (regulated)
                if 'תנובה' in name and ('3%' in name or '1%' in name or 'דל שומן' in name):
                    if abs(price - REGULATED_PRICE) > 0.50:
                        status = f" ⚠️  WRONG (should be ~{REGULATED_PRICE}₪)"
                    else:
                        status = " ✅"

                print(f"      - {chain_name}: {price:.2f}₪{status}")

            # Calculate average
            avg_price = sum(p['price'] for p in product_prices) / len(product_prices)
            print(f"   Average: {avg_price:.2f}₪")
        else:
            print("   No prices found!")

    print("\n" + "=" * 70)
    print("Summary of Issues")
    print("=" * 70)

    issues = []
    for product in milk_products:
        product_id = product['id']
        name = product['name']

        # Check regulated Tnuva milk
        if 'תנובה' in name and ('3%' in name or '1%' in name or 'דל שומן' in name):
            product_prices = price_by_product.get(product_id, [])
            for pp in product_prices:
                if abs(pp['price'] - REGULATED_PRICE) > 0.50:
                    chain_name = chain_names.get(pp['chain_id'], 'Unknown')
                    issues.append({
                        'product': name,
                        'chain': chain_name,
                        'current': pp['price'],
                        'expected': REGULATED_PRICE,
                        'price_id': pp['id']
                    })

    if issues:
        print(f"\n❌ Found {len(issues)} incorrect prices:\n")
        for issue in issues:
            print(f"   {issue['product']}")
            print(f"      Chain: {issue['chain']}")
            print(f"      Current: {issue['current']:.2f}₪ → Should be: {issue['expected']:.2f}₪")
            print(f"      Price ID: {issue['price_id']}")
            print()
    else:
        print("\n✅ All regulated milk prices are correct!")


if __name__ == '__main__':
    check_milk_prices()
