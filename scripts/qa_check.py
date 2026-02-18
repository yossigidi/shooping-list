#!/usr/bin/env python3
"""QA Check: Compare product names between app and database"""

from supabase import create_client
import os
import re

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Key products that users commonly search for
COMMON_SEARCHES = [
    # Dairy
    'חלב', 'חלב 3%', 'חלב 1%', 'יוגורט', 'גבינה צהובה', 'קוטג', 'שמנת', 'חמאה', 'ביצים',
    # Bread
    'לחם', 'לחם לבן', 'לחם מלא', 'פיתה', 'חלה',
    # Vegetables
    'עגבניות', 'מלפפון', 'בצל', 'תפוח אדמה', 'גזר', 'חסה', 'פלפל',
    # Fruits
    'תפוח', 'בננה', 'תפוז', 'לימון', 'אבוקדו', 'ענבים',
    # Meat
    'עוף', 'חזה עוף', 'בשר טחון', 'סטייק', 'שניצל', 'נקניק',
    # Fish
    'סלמון', 'טונה', 'דג', 'סרדינים',
    # Pantry
    'אורז', 'פסטה', 'שמן זית', 'סוכר', 'מלח', 'קמח', 'שמן',
    # Drinks
    'מים', 'קולה', 'מיץ תפוזים', 'קפה', 'תה',
    # Baby
    'חיתולים', 'פורמולה', 'מטרנה', 'סימילק',
    # Cleaning
    'נייר טואלט', 'סבון', 'שמפו', 'אקונומיקה',
    # Snacks
    'במבה', 'ביסלי', 'שוקולד', 'עוגיות',
    # Alcohol
    'בירה', 'יין', 'וודקה', 'וויסקי',
]

def get_all_products():
    """Fetch all products with pagination"""
    all_products = []
    offset = 0
    while True:
        batch = supabase.table('products').select('*').range(offset, offset + 999).execute().data
        if not batch:
            break
        all_products.extend(batch)
        offset += 1000
    return all_products

def get_all_prices():
    all_prices = []
    offset = 0
    while True:
        batch = supabase.table('prices').select('*').range(offset, offset + 999).execute().data
        if not batch:
            break
        all_prices.extend(batch)
        offset += 1000
    return all_prices

def find_matching_products(search_term, products):
    """Simulate the API's matching algorithm"""
    search_term = search_term.lower().strip()
    search_words = [w for w in search_term.split() if len(w) > 1]

    matches = []
    for p in products:
        product_name = p['name'].lower()
        product_words = [w for w in product_name.split() if len(w) > 1]
        score = 0

        # Exact match
        if product_name == search_term:
            score = 1000
        # Product contains search term
        elif search_term in product_name:
            score = 500
        # Search term contains product name
        elif product_name in search_term:
            score = 400
        else:
            # Word matching
            exact_matches = 0
            matched_words = set()
            for sw in search_words:
                for pw in product_words:
                    if pw == sw:
                        exact_matches += 1
                        matched_words.add(sw)

            if exact_matches > 0:
                score = exact_matches * 50
                match_pct = len(matched_words) / len(search_words) if search_words else 0
                score *= (1 + match_pct)
                if len(matched_words) == len(search_words):
                    score += 100

        if score > 0:
            matches.append({'product': p, 'score': score})

    matches.sort(key=lambda x: x['score'], reverse=True)
    return matches

def main():
    print("=" * 70)
    print("QA CHECK: Product Name Matching")
    print("=" * 70)

    products = get_all_products()
    prices = get_all_prices()

    print(f"\nDatabase has {len(products)} products and {len(prices)} price records\n")

    # Create price lookup
    price_lookup = {}
    for p in prices:
        pid = p['product_id']
        if pid not in price_lookup:
            price_lookup[pid] = []
        price_lookup[pid].append(p['price'])

    # Test each common search
    print("=" * 70)
    print("SEARCH RESULTS FOR COMMON PRODUCTS")
    print("=" * 70)

    issues = []
    good_matches = []

    for search in COMMON_SEARCHES:
        matches = find_matching_products(search, products)

        if not matches:
            issues.append({
                'search': search,
                'issue': 'NO_MATCH',
                'message': f'No product found for "{search}"'
            })
            print(f"\n❌ \"{search}\" - NO MATCH FOUND")
        else:
            best = matches[0]['product']
            score = matches[0]['score']

            # Check if has prices
            has_prices = best['id'] in price_lookup
            avg_price = 0
            if has_prices:
                prices_list = price_lookup[best['id']]
                avg_price = sum(prices_list) / len(prices_list)

            if not has_prices:
                issues.append({
                    'search': search,
                    'issue': 'NO_PRICES',
                    'message': f'"{search}" matched "{best["name"]}" but has no prices'
                })
                print(f"\n⚠️  \"{search}\" -> \"{best['name']}\" (NO PRICES)")
            elif score < 100:
                issues.append({
                    'search': search,
                    'issue': 'LOW_SCORE',
                    'message': f'"{search}" matched "{best["name"]}" with low score {score:.0f}'
                })
                print(f"\n⚠️  \"{search}\" -> \"{best['name']}\" (LOW SCORE: {score:.0f})")
            else:
                good_matches.append({
                    'search': search,
                    'matched': best['name'],
                    'price': avg_price,
                    'score': score
                })
                print(f"\n✅ \"{search}\" -> \"{best['name']}\" ({avg_price:.2f}₪, score: {score:.0f})")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"\nTotal searches tested: {len(COMMON_SEARCHES)}")
    print(f"Good matches: {len(good_matches)}")
    print(f"Issues found: {len(issues)}")

    if issues:
        print("\n" + "-" * 70)
        print("ISSUES TO FIX:")
        print("-" * 70)
        for issue in issues:
            print(f"\n  [{issue['issue']}] {issue['message']}")

    # Check for products with unusual names
    print("\n" + "=" * 70)
    print("PRODUCTS WITH POTENTIAL NAME ISSUES")
    print("=" * 70)

    name_issues = []
    for p in products:
        name = p['name']
        # Check for common issues
        if '  ' in name:
            name_issues.append(f"Double space: \"{name}\"")
        if name.startswith(' ') or name.endswith(' '):
            name_issues.append(f"Leading/trailing space: \"{name}\"")
        if len(name) < 2:
            name_issues.append(f"Too short: \"{name}\"")
        if len(name) > 50:
            name_issues.append(f"Very long: \"{name}\"")

    if name_issues:
        print("\nName formatting issues:")
        for issue in name_issues[:20]:
            print(f"  • {issue}")
    else:
        print("\nNo name formatting issues found ✅")

    print("\n" + "=" * 70)
    print("QA CHECK COMPLETE")
    print("=" * 70)

if __name__ == '__main__':
    main()
