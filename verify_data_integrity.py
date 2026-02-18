#!/usr/bin/env python3
"""
Supabase Data Integrity Verification Script
"""

import os
import requests
import json
from collections import Counter

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def query_supabase(table, select="*", filters=None, limit=None):
    """Query Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={select}"
    if filters:
        url += f"&{filters}"
    if limit:
        url += f"&limit={limit}"

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error querying {table}: {response.status_code} - {response.text}")
        return []

def count_records(table):
    """Count records in a table"""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=count"
    h = headers.copy()
    h["Prefer"] = "count=exact"
    response = requests.get(url, headers=h)
    if response.status_code == 200:
        count = response.headers.get('content-range', '').split('/')[-1]
        return int(count) if count and count != '*' else len(response.json())
    return 0

def get_all_records(table, select="*"):
    """Get all records with pagination"""
    all_records = []
    offset = 0
    limit = 1000

    while True:
        url = f"{SUPABASE_URL}/rest/v1/{table}?select={select}&limit={limit}&offset={offset}"
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if not data:
                break
            all_records.extend(data)
            if len(data) < limit:
                break
            offset += limit
        else:
            break

    return all_records

print("=" * 60)
print("SUPABASE DATA INTEGRITY VERIFICATION REPORT")
print("=" * 60)

# 1. Count total products
print("\n1. TOTAL PRODUCTS")
print("-" * 40)
products = get_all_records("products")
print(f"   Total products: {len(products)}")

# 2. Count total prices
print("\n2. TOTAL PRICES")
print("-" * 40)
prices = get_all_records("prices")
print(f"   Total price records: {len(prices)}")

# 3. Count chains
print("\n3. CHAINS")
print("-" * 40)
chains = get_all_records("chains")
print(f"   Total chains: {len(chains)}")
for chain in chains:
    print(f"   - {chain.get('name', 'Unknown')} (ID: {chain.get('id')})")

# 4. Check for products without prices
print("\n4. PRODUCTS WITHOUT PRICES")
print("-" * 40)
product_ids_with_prices = set(p.get('product_id') for p in prices)
products_without_prices = [p for p in products if p.get('id') not in product_ids_with_prices]
print(f"   Products without any prices: {len(products_without_prices)}")
if products_without_prices[:5]:
    print("   First 5 examples:")
    for p in products_without_prices[:5]:
        print(f"   - {p.get('name', 'Unknown')} (ID: {p.get('id')})")

# 5. Check for unusual prices
print("\n5. UNUSUAL PRICES")
print("-" * 40)
low_prices = []
high_prices = []

for price in prices:
    price_val = price.get('price', 0)
    if price_val is not None:
        if price_val < 1:
            low_prices.append(price)
        elif price_val > 500:
            high_prices.append(price)

print(f"   Prices below 1₪: {len(low_prices)}")
if low_prices[:5]:
    for p in low_prices[:5]:
        prod = next((pr for pr in products if pr.get('id') == p.get('product_id')), {})
        print(f"   - {prod.get('name', 'Unknown')}: {p.get('price')}₪")

print(f"   Prices above 500₪: {len(high_prices)}")
if high_prices[:5]:
    for p in high_prices[:5]:
        prod = next((pr for pr in products if pr.get('id') == p.get('product_id')), {})
        print(f"   - {prod.get('name', 'Unknown')}: {p.get('price')}₪")

# 6. Check baby formula products
print("\n6. BABY FORMULA PRODUCTS CHECK")
print("-" * 40)
expected_formula_prices = [54.90, 74.90, 75.90, 69.90, 59.90, 64.90, 79.90, 84.90]

# Find baby formula products
formula_products = [p for p in products if any(term in p.get('name', '').lower() for term in ['פורמולה', 'תמ"ל', 'תמל', 'חלב אם', 'סימילאק', 'מטרנה', 'נוטרילון', 'formula', 'infant'])]

print(f"   Found {len(formula_products)} baby formula products:")
for prod in formula_products:
    prod_prices = [p for p in prices if p.get('product_id') == prod.get('id')]
    print(f"\n   Product: {prod.get('name')}")
    print(f"   Category: {prod.get('category', 'N/A')}")
    if prod_prices:
        for pp in prod_prices:
            chain = next((c for c in chains if c.get('id') == pp.get('chain_id')), {})
            price_val = pp.get('price')
            status = "✓" if price_val in expected_formula_prices else "⚠ UNEXPECTED"
            print(f"   - {chain.get('name', 'Unknown')}: {price_val}₪ {status}")
    else:
        print("   - NO PRICES FOUND!")

# 7. Check for duplicate products
print("\n7. DUPLICATE PRODUCTS CHECK")
print("-" * 40)
product_names = [p.get('name', '').strip().lower() for p in products]
name_counts = Counter(product_names)
duplicates = {name: count for name, count in name_counts.items() if count > 1 and name}

print(f"   Duplicate product names found: {len(duplicates)}")
if duplicates:
    print("   Examples:")
    for name, count in list(duplicates.items())[:10]:
        print(f"   - '{name}': {count} occurrences")

# Also check by barcode if available
barcodes = [p.get('barcode') for p in products if p.get('barcode')]
barcode_counts = Counter(barcodes)
duplicate_barcodes = {bc: count for bc, count in barcode_counts.items() if count > 1}

print(f"   Duplicate barcodes found: {len(duplicate_barcodes)}")
if duplicate_barcodes:
    print("   Examples:")
    for bc, count in list(duplicate_barcodes.items())[:5]:
        print(f"   - Barcode '{bc}': {count} occurrences")

# 8. List all categories and product counts
print("\n8. CATEGORIES AND PRODUCT COUNTS")
print("-" * 40)
categories = Counter(p.get('category', 'No Category') for p in products)
print(f"   Total categories: {len(categories)}")
print("\n   Category breakdown:")
for category, count in sorted(categories.items(), key=lambda x: -x[1]):
    print(f"   - {category}: {count} products")

# 9. Summary Report
print("\n" + "=" * 60)
print("SUMMARY REPORT")
print("=" * 60)
print(f"""
Data Statistics:
- Total Products: {len(products)}
- Total Prices: {len(prices)}
- Total Chains: {len(chains)}
- Products without prices: {len(products_without_prices)}
- Unusual prices (< 1₪): {len(low_prices)}
- Unusual prices (> 500₪): {len(high_prices)}
- Baby formula products: {len(formula_products)}
- Duplicate product names: {len(duplicates)}
- Duplicate barcodes: {len(duplicate_barcodes)}
- Total categories: {len(categories)}

Data Integrity Status:
""")

issues = []
if products_without_prices:
    issues.append(f"⚠ {len(products_without_prices)} products have no prices")
if low_prices:
    issues.append(f"⚠ {len(low_prices)} prices are below 1₪")
if high_prices:
    issues.append(f"⚠ {len(high_prices)} prices are above 500₪")
if duplicates:
    issues.append(f"⚠ {len(duplicates)} duplicate product names found")
if duplicate_barcodes:
    issues.append(f"⚠ {len(duplicate_barcodes)} duplicate barcodes found")

if issues:
    for issue in issues:
        print(f"   {issue}")
else:
    print("   ✓ No major data integrity issues found!")

print("\n" + "=" * 60)
print("END OF REPORT")
print("=" * 60)
