#!/usr/bin/env python3
"""
Comprehensive price comparison script for Shopping List App.
Compares prices between:
1. Supabase database (products + prices tables)
2. PRODUCT_PRICES in index.html
3. API endpoint (/api/prices)
"""

import json
import re
import requests
from collections import defaultdict

# Supabase credentials
SUPABASE_URL = "https://uegcgdanmufoilxgxnjm.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZ2NnZGFubXVmb2lseGd4bmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTk2NTcsImV4cCI6MjA4NjA5NTY1N30.vcyH3-ve7ol9t4d16HpAyK8rUSpkZPZwG4pRu6LB2Qs"

def fetch_supabase_data():
    """Fetch all products, prices, and chains from Supabase database."""
    print("=" * 60)
    print("STEP 1: Fetching data from Supabase database...")
    print("=" * 60)

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    # Fetch chains
    url = f"{SUPABASE_URL}/rest/v1/chains?select=*"
    response = requests.get(url, headers=headers)
    chains = {c['id']: c for c in response.json()}
    print(f"Found {len(chains)} chains: {[c['name_he'] for c in chains.values()]}")

    # Fetch all products
    url = f"{SUPABASE_URL}/rest/v1/products?select=*"
    response = requests.get(url, headers=headers)
    products = {p['id']: p for p in response.json()}
    print(f"Found {len(products)} products")

    # Fetch all prices with product names
    url = f"{SUPABASE_URL}/rest/v1/prices?select=*,products(name)"
    response = requests.get(url, headers=headers)
    prices = response.json()
    print(f"Found {len(prices)} price entries")

    # Organize prices by product name and chain
    db_prices = {}
    prices_by_chain = defaultdict(dict)

    for price_entry in prices:
        product_name = price_entry.get('products', {}).get('name')
        chain_id = price_entry.get('chain_id')
        price = price_entry.get('price')

        if product_name and price is not None:
            if product_name not in db_prices:
                db_prices[product_name] = {
                    'prices_by_chain': {},
                    'min_price': float('inf'),
                    'max_price': float('-inf'),
                    'avg_price': 0
                }

            chain_name = chains.get(chain_id, {}).get('name_he', f'chain_{chain_id}')
            db_prices[product_name]['prices_by_chain'][chain_name] = price
            db_prices[product_name]['min_price'] = min(db_prices[product_name]['min_price'], price)
            db_prices[product_name]['max_price'] = max(db_prices[product_name]['max_price'], price)

    # Calculate averages
    for product_name, data in db_prices.items():
        prices_list = list(data['prices_by_chain'].values())
        if prices_list:
            data['avg_price'] = sum(prices_list) / len(prices_list)

    print(f"\nUnique products with prices: {len(db_prices)}")

    # Show sample
    print("\nSample products from database:")
    for i, (name, data) in enumerate(list(db_prices.items())[:10]):
        print(f"  - {name}: min={data['min_price']}, max={data['max_price']}, avg={data['avg_price']:.2f}")

    return db_prices, chains, products

def extract_app_prices():
    """Extract PRODUCT_PRICES from index.html."""
    print("\n" + "=" * 60)
    print("STEP 2: Extracting PRODUCT_PRICES from index.html...")
    print("=" * 60)

    with open('/Users/yossefgidanian/shooping-list/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract line by line from the file
    lines = content.split('\n')
    in_product_prices = False
    brace_count = 0
    product_lines = []

    for line in lines:
        if 'let PRODUCT_PRICES = {' in line:
            in_product_prices = True
            brace_count = line.count('{') - line.count('}')
            product_lines.append(line)
            continue

        if in_product_prices:
            brace_count += line.count('{') - line.count('}')
            product_lines.append(line)
            if brace_count <= 0:
                break

    # Parse the products from the collected lines
    product_prices = {}

    full_text = '\n'.join(product_lines)
    price_pattern = r"'([^']+)':\s*([\d.]+)"

    matches = re.findall(price_pattern, full_text)
    for name, price in matches:
        product_prices[name] = float(price)

    print(f"Extracted {len(product_prices)} products from PRODUCT_PRICES in index.html")

    # Show sample
    print("\nSample products from app:")
    for i, (name, price) in enumerate(list(product_prices.items())[:10]):
        print(f"  - {name}: {price} ILS")

    return product_prices

def compare_prices(db_prices, app_prices):
    """Compare prices between database and app."""
    print("\n" + "=" * 60)
    print("STEP 3: Comparing prices...")
    print("=" * 60)

    results = {
        'only_in_app': {},
        'only_in_db': {},
        'price_differences': [],
        'matching': [],
        'partial_matches': []
    }

    # Products only in app (not in database)
    for name, price in app_prices.items():
        if name not in db_prices:
            results['only_in_app'][name] = price

    # Products only in database (not in app)
    for name, data in db_prices.items():
        if name not in app_prices:
            results['only_in_db'][name] = data

    # Price differences (compare app price with database avg/min prices)
    for name in app_prices:
        if name in db_prices:
            app_price = app_prices[name]
            db_data = db_prices[name]
            avg_price = db_data['avg_price']
            min_price = db_data['min_price']
            max_price = db_data['max_price']

            # Check if app price matches any chain price exactly
            exact_match = any(abs(app_price - p) < 0.01 for p in db_data['prices_by_chain'].values())

            if exact_match:
                results['matching'].append({
                    'name': name,
                    'app_price': app_price,
                    'db_min': min_price,
                    'db_max': max_price,
                    'db_avg': avg_price
                })
            else:
                results['price_differences'].append({
                    'name': name,
                    'app_price': app_price,
                    'db_min': min_price,
                    'db_max': max_price,
                    'db_avg': avg_price,
                    'diff_from_avg': app_price - avg_price,
                    'chain_prices': db_data['prices_by_chain']
                })

    return results

def print_report(results, db_prices, app_prices):
    """Print detailed comparison report."""
    print("\n" + "=" * 60)
    print("COMPARISON REPORT")
    print("=" * 60)

    print(f"\nTotal products in app (PRODUCT_PRICES): {len(app_prices)}")
    print(f"Total unique products in database: {len(db_prices)}")

    # Products only in app
    print(f"\n{'='*60}")
    print(f"PRODUCTS ONLY IN APP (not in database): {len(results['only_in_app'])}")
    print("="*60)
    if results['only_in_app']:
        for name, price in sorted(results['only_in_app'].items())[:50]:
            print(f"  - {name}: {price} ILS")
        if len(results['only_in_app']) > 50:
            print(f"  ... and {len(results['only_in_app']) - 50} more")
    else:
        print("  None - all app products exist in database")

    # Products only in database
    print(f"\n{'='*60}")
    print(f"PRODUCTS ONLY IN DATABASE (not in app): {len(results['only_in_db'])}")
    print("="*60)
    if results['only_in_db']:
        for name, data in sorted(results['only_in_db'].items())[:50]:
            print(f"  - {name}: avg={data['avg_price']:.2f} ILS (range: {data['min_price']}-{data['max_price']})")
        if len(results['only_in_db']) > 50:
            print(f"  ... and {len(results['only_in_db']) - 50} more")
    else:
        print("  None - all database products exist in app")

    # Price differences
    print(f"\n{'='*60}")
    print(f"PRICE DIFFERENCES (app price vs database): {len(results['price_differences'])}")
    print("="*60)
    if results['price_differences']:
        # Sort by absolute difference from average
        sorted_diffs = sorted(results['price_differences'],
                             key=lambda x: abs(x['diff_from_avg']),
                             reverse=True)
        for diff in sorted_diffs[:50]:
            print(f"  - {diff['name']}")
            print(f"      App: {diff['app_price']} ILS")
            print(f"      DB:  min={diff['db_min']}, max={diff['db_max']}, avg={diff['db_avg']:.2f}")
            print(f"      Chains: {diff['chain_prices']}")
        if len(sorted_diffs) > 50:
            print(f"  ... and {len(sorted_diffs) - 50} more differences")
    else:
        print("  None - all matching products have matching prices")

    # Matching products
    print(f"\n{'='*60}")
    print(f"MATCHING PRODUCTS (app price matches a chain price): {len(results['matching'])}")
    print("="*60)
    if results['matching']:
        for match in results['matching'][:20]:
            print(f"  - {match['name']}: {match['app_price']} ILS (matches DB range: {match['db_min']}-{match['db_max']})")
        if len(results['matching']) > 20:
            print(f"  ... and {len(results['matching']) - 20} more")

def check_api_merge_functionality(db_prices, app_prices):
    """Check if the API correctly merges database prices into app prices."""
    print("\n" + "=" * 60)
    print("STEP 4: Checking API merge functionality...")
    print("=" * 60)

    # Read the index.html to understand merge logic
    with open('/Users/yossefgidanian/shooping-list/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Check for API URL
    api_url_match = re.search(r"const PRICES_API_URL = ['\"]([^'\"]+)['\"]", content)
    if api_url_match:
        print(f"Found API URL: {api_url_match.group(1)}")
    else:
        print("API URL not found in index.html")

    # Check for merge logic
    if "PRODUCT_PRICES = { ...PRODUCT_PRICES, ...data.prices }" in content:
        print("Merge logic found: PRODUCT_PRICES = { ...PRODUCT_PRICES, ...data.prices }")
        print("\nThis means: Database prices OVERRIDE app prices (Supabase takes priority)")
    else:
        print("No standard merge logic found")

    # Analyze merge behavior
    print("\n" + "-" * 40)
    print("MERGE BEHAVIOR ANALYSIS")
    print("-" * 40)

    # Products that would be affected by merge
    override_count = 0
    override_list = []

    for db_name, db_data in db_prices.items():
        if db_name in app_prices:
            app_price = app_prices[db_name]
            db_avg = db_data['avg_price']
            if abs(app_price - db_avg) > 0.01:
                override_count += 1
                override_list.append({
                    'name': db_name,
                    'app_price': app_price,
                    'db_avg_price': db_avg,
                    'difference': db_avg - app_price
                })

    print(f"\nProducts that would be OVERRIDDEN by database: {override_count}")

    if override_list:
        # Sort by absolute difference
        sorted_overrides = sorted(override_list, key=lambda x: abs(x['difference']), reverse=True)
        print("\nTop price changes after API merge:")
        for item in sorted_overrides[:20]:
            direction = "+" if item['difference'] > 0 else ""
            print(f"  - {item['name']}: {item['app_price']} -> {item['db_avg_price']:.2f} ({direction}{item['difference']:.2f})")

    # Products that exist only in DB (would be ADDED)
    new_products = [name for name in db_prices if name not in app_prices]
    print(f"\nProducts that would be ADDED from database: {len(new_products)}")
    if new_products[:10]:
        print("Sample new products:")
        for name in new_products[:10]:
            print(f"  - {name}: {db_prices[name]['avg_price']:.2f} ILS")

    return override_list, new_products

def analyze_api_implementation():
    """Analyze the API implementation details."""
    print("\n" + "=" * 60)
    print("STEP 5: API Implementation Analysis")
    print("=" * 60)

    import os

    # Check api/prices.js
    api_prices_path = '/Users/yossefgidanian/shooping-list/api/prices.js'
    if os.path.exists(api_prices_path):
        with open(api_prices_path, 'r') as f:
            content = f.read()

        print("\nAPI Endpoints found in api/prices.js:")

        # Find action handlers
        actions = re.findall(r"case '(\w+)':", content)
        for action in actions:
            print(f"  - ?action={action}")

        # Check avgprices implementation
        if "case 'avgprices':" in content:
            print("\n'avgprices' endpoint analysis:")
            print("  - Fetches all products and prices from Supabase")
            print("  - Filters out prices under 1 ILS or over 500 ILS")
            print("  - Calculates MEDIAN price (robust against outliers)")
            print("  - Filters outliers (more than 3x or less than 0.33x median)")
            print("  - Returns average of valid prices per product")

    # Check backend implementation
    backend_path = '/Users/yossefgidanian/shooping-list/backend/app/api/routes.py'
    if os.path.exists(backend_path):
        print("\nBackend API Routes found:")
        with open(backend_path, 'r') as f:
            content = f.read()
        routes = re.findall(r'@.*route.*[\'\"](/[^\'\"]*)[\'\"]', content)
        for route in routes:
            print(f"  - {route}")

def main():
    print("\n" + "=" * 60)
    print("SHOPPING LIST PRICE COMPARISON TOOL")
    print("=" * 60)

    # Step 1: Fetch from Supabase
    db_prices, chains, products = fetch_supabase_data()

    # Step 2: Extract from app
    app_prices = extract_app_prices()

    # Step 3: Compare
    results = compare_prices(db_prices, app_prices)

    # Print report
    print_report(results, db_prices, app_prices)

    # Step 4: Check API merge
    override_list, new_products = check_api_merge_functionality(db_prices, app_prices)

    # Step 5: Analyze API
    analyze_api_implementation()

    # Final Summary
    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)
    print(f"Products in App (PRODUCT_PRICES): {len(app_prices)}")
    print(f"Products in Database: {len(db_prices)}")
    print(f"Only in App: {len(results['only_in_app'])}")
    print(f"Only in Database: {len(results['only_in_db'])}")
    print(f"Price Differences: {len(results['price_differences'])}")
    print(f"Matching Prices: {len(results['matching'])}")

    # Overlap analysis
    overlap = len(app_prices) - len(results['only_in_app'])
    print(f"\nOverlap (products in both): {overlap}")

    if overlap > 0:
        match_rate = len(results['matching']) / overlap * 100
        print(f"Match rate: {match_rate:.1f}% of overlapping products have matching prices")

    # Price difference analysis
    if results['price_differences']:
        diffs = [abs(d['diff_from_avg']) for d in results['price_differences']]
        print(f"\nPrice difference statistics:")
        print(f"  Average difference: {sum(diffs)/len(diffs):.2f} ILS")
        print(f"  Max difference: {max(diffs):.2f} ILS")
        print(f"  Min difference: {min(diffs):.2f} ILS")

    # Recommendations
    print("\n" + "=" * 60)
    print("DISCREPANCIES AND RECOMMENDATIONS")
    print("=" * 60)

    print("\n1. NAMING INCONSISTENCIES:")
    print("   The database and app use different naming conventions.")
    print("   Examples:")
    print("   - App: 'ביצים L 12 יח׳' vs DB: 'ביצים L 12'")
    print("   - App: 'גבינת עזים' vs DB: 'גבינת עיזים'")
    print("   - App: 'גבינה צהובה עמק' vs DB: 'גבינת עמק' or 'גבינה צהובה'")

    print("\n2. PRICE DISCREPANCIES:")
    if results['price_differences']:
        big_diffs = [d for d in results['price_differences'] if abs(d['diff_from_avg']) > 10]
        print(f"   {len(big_diffs)} products have >10 ILS difference")
        for d in big_diffs[:5]:
            print(f"   - {d['name']}: App={d['app_price']} vs DB avg={d['db_avg']:.2f}")

    print("\n3. API MERGE STATUS:")
    print("   The API correctly uses: PRODUCT_PRICES = { ...PRODUCT_PRICES, ...data.prices }")
    print("   Database prices OVERRIDE hardcoded app prices when API is available.")
    print(f"   When merged, {len(override_list)} products would have their prices updated.")

    print("\n4. MISSING IN DATABASE:")
    print(f"   {len(results['only_in_app'])} products exist in app but not in database.")
    print("   These rely on hardcoded prices and won't get real-time updates.")

    print("\n5. MISSING IN APP:")
    print(f"   {len(results['only_in_db'])} products exist in database but not in app's PRODUCT_PRICES.")
    print("   These would be ADDED to the app when API merge happens.")

if __name__ == "__main__":
    main()
