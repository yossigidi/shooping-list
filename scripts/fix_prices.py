#!/usr/bin/env python3
"""
ListNest Price Fixer
====================
Fixes incorrect prices in Supabase by using expected prices.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# Correct prices for products that might have errors
# Format: product_name -> correct_average_price
CORRECT_PRICES = {
    # Spreads
    'ממרח לוטוס': 26.90,
    'ממרח לוטוס 400 גרם': 26.90,
    'עוגיות לוטוס': 12.90,
    'נוטלה': 24.90,
    'נוטלה 350 גרם': 24.90,
    'נוטלה 750 גרם': 44.90,
    'חמאת בוטנים': 24.90,
    'ממרח שוקולד': 18.90,

    # Dairy - REGULATED MILK PRICES (מחירים מפוקחים)
    'חלב 3%': 7.28,
    'חלב 1%': 7.28,
    'חלב תנובה': 7.28,
    'חלב תנובה 3%': 7.28,
    'חלב תנובה 1%': 7.28,
    'חלב תנובה 3% 1 ליטר': 7.28,
    'חלב תנובה 1% 1 ליטר': 7.28,
    'חלב תנובה דל שומן': 7.28,
    'חלב תנובה דל שומן 1 ליטר': 7.28,
    'חלב 3% 1 ליטר': 7.28,
    'חלב 1% 1 ליטר': 7.28,
    'חלב דל שומן 1 ליטר': 7.28,
    'יוגורט': 5.90,
    'קוטג\'': 8.90,

    # Basics
    'קמח': 6.90,
    'סוכר': 8.90,
    'מלח': 3.90,
    'שמן זית': 34.90,
    'שמן קנולה': 14.90,

    # Spices (packaged)
    'פפריקה מתוקה 80 גרם': 8.90,
    'פפריקה מתוקה 100 גרם': 10.90,
    'פפריקה חריפה 80 גרם': 8.90,
    'פפריקה חריפה 100 גרם': 10.90,
    'פלפל שחור טחון 80 גרם': 9.90,
    'פלפל שחור טחון 100 גרם': 11.90,
    'כורכום 80 גרם': 12.90,
    'כורכום 100 גרם': 14.90,

    # Tahini
    'טחינה': 18.90,
    'טחינה 250 גרם': 16.90,
    'טחינה 500 גרם': 24.90,
    'טחינה גולמית': 22.90,

    # Hummus
    'חומוס': 12.90,
    'חומוס מוכן': 9.90,
}

# Maximum reasonable price threshold
MAX_PRICE_THRESHOLD = 80


def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def fix_prices():
    print("=" * 60)
    print("ListNest Price Fixer")
    print("=" * 60)

    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase\n")
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # Get all products and prices
    products = supabase.table('products').select('id, name').execute()
    prices = supabase.table('prices').select('id, product_id, chain_id, price').execute()
    chains = supabase.table('chains').select('id, name').execute()

    chain_names = {c['id']: c['name'] for c in chains.data}
    product_names = {p['id']: p['name'] for p in products.data}
    product_ids = {p['name']: p['id'] for p in products.data}

    fixed_count = 0
    errors = []

    print("Checking and fixing prices...\n")

    # Regulated products need stricter tolerance (±15% instead of ±200%)
    REGULATED_KEYWORDS = ['חלב תנובה', 'חלב 3%', 'חלב 1%', 'חלב דל שומן']

    for price_record in prices.data:
        product_id = price_record['product_id']
        current_price = price_record['price']
        product_name = product_names.get(product_id, '')

        # Check if price is suspiciously high
        needs_fix = False
        correct_price = None
        is_regulated = any(kw in product_name for kw in REGULATED_KEYWORDS)

        # First check if we have a direct correction
        if product_name in CORRECT_PRICES:
            correct_price = CORRECT_PRICES[product_name]
            if is_regulated:
                # Stricter tolerance for regulated products (±15%)
                if current_price > correct_price * 1.15 or current_price < correct_price * 0.85:
                    needs_fix = True
            else:
                if current_price > correct_price * 2 or current_price < correct_price * 0.3:
                    needs_fix = True
        # Check partial matches
        else:
            for keyword, price in CORRECT_PRICES.items():
                if keyword in product_name and len(keyword) >= 4:
                    correct_price = price
                    if is_regulated:
                        # Stricter tolerance for regulated products
                        if current_price > price * 1.15 or current_price < price * 0.85:
                            needs_fix = True
                    else:
                        if current_price > price * 3 or current_price < price * 0.2:
                            needs_fix = True
                    break

        # Also fix any price over threshold for non-luxury items
        if current_price > MAX_PRICE_THRESHOLD and not any(x in product_name for x in ['בשר', 'סלמון', 'אנטריקוט', 'פילה']):
            needs_fix = True
            # Use partial match if no correct price found
            if not correct_price:
                for keyword, price in CORRECT_PRICES.items():
                    if keyword in product_name:
                        correct_price = price
                        break

        if needs_fix and correct_price:
            chain_name = chain_names.get(price_record['chain_id'], 'Unknown')
            print(f"🔧 Fixing: {product_name}")
            print(f"   Chain: {chain_name}")
            print(f"   Old price: {current_price:.2f}₪ -> New price: {correct_price:.2f}₪")

            try:
                # Add some chain variation (±10%)
                import random
                variation = random.uniform(0.9, 1.1)
                adjusted_price = round(correct_price * variation, 2)

                supabase.table('prices').update({
                    'price': adjusted_price
                }).eq('id', price_record['id']).execute()

                print(f"   ✅ Updated to {adjusted_price:.2f}₪\n")
                fixed_count += 1
            except Exception as e:
                print(f"   ❌ Error: {e}\n")
                errors.append(f"{product_name}: {e}")

    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Prices fixed: {fixed_count}")
    if errors:
        print(f"Errors: {len(errors)}")
        for e in errors:
            print(f"  - {e}")


if __name__ == '__main__':
    fix_prices()
