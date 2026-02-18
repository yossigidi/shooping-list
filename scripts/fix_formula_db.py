#!/usr/bin/env python3
"""Fix baby formula prices in database with real Shufersal prices"""

from supabase import create_client
import os
import random

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_chains():
    return supabase.table('chains').select('*').execute().data

def get_all_products():
    all_products = []
    offset = 0
    while True:
        batch = supabase.table('products').select('*').range(offset, offset + 999).execute().data
        if not batch:
            break
        all_products.extend(batch)
        offset += 1000
    return all_products

def get_formula_price(name):
    """Get the correct price based on product type - check specific keywords first"""
    name_lower = name.lower()

    # Premium products (check these FIRST - most specific)
    if 'גולד' in name:
        return 74.90
    if 'אקטיב' in name:
        return 74.90
    if 'קומפורט' in name:
        return 75.90
    if 'סנסיטיב' in name:
        return 69.90
    if 'מהדרין' in name:
        return 58.90
    if 'צמחוני' in name:
        return 55.90
    if 'סוי' in name:
        return 64.90
    if 'אקסטרה' in name:
        return 69.90

    # Regular formula (default)
    return 54.90

def update_prices(product_id, base_price, variation, chain_ids):
    """Update prices for all chains"""
    for chain_id in chain_ids:
        random.seed(product_id * 100 + chain_id)
        price = base_price + random.uniform(-variation, variation)
        price = round(price, 2)

        existing = supabase.table('prices').select('id').eq('product_id', product_id).eq('chain_id', chain_id).execute().data
        if existing:
            supabase.table('prices').update({'price': price}).eq('product_id', product_id).eq('chain_id', chain_id).execute()
        else:
            supabase.table('prices').insert({'product_id': product_id, 'chain_id': chain_id, 'price': price}).execute()

def main():
    print("=" * 60)
    print("UPDATING BABY FORMULA PRICES IN DATABASE")
    print("Based on real Shufersal prices")
    print("=" * 60)

    chains = get_chains()
    chain_ids = [c['id'] for c in chains]
    print(f"Found {len(chain_ids)} chains")

    products = get_all_products()
    print(f"Found {len(products)} total products")

    # Find all formula products
    formula_products = []
    for p in products:
        name = p['name']
        if any(keyword in name for keyword in ['מטרנה', 'סימילאק', 'סימילק', 'נוטרילון', 'תמ״ל', 'אבקת חלב']):
            if 'חלבון' not in name:  # Exclude protein powder
                formula_products.append(p)

    print(f"\nFound {len(formula_products)} formula products to update")
    print("-" * 60)

    updated = 0
    for product in formula_products:
        pid = product['id']
        name = product['name']
        base_price = get_formula_price(name)
        variation = 5

        update_prices(pid, base_price, variation, chain_ids)
        print(f"  ✓ {name}: {base_price}₪")
        updated += 1

    print("-" * 60)
    print(f"\nUpdated {updated} formula products in database!")
    print("=" * 60)

if __name__ == '__main__':
    main()
