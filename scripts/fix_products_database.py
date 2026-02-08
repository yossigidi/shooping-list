#!/usr/bin/env python3
"""
ListNest Database Fixer
=======================
1. Removes duplicate products (keeps first occurrence)
2. Adds missing products with barcodes from Open Food Facts
"""

import os
import time
import requests
from datetime import datetime
from typing import Dict, List, Set
from collections import Counter
from supabase import create_client, Client

# ============================================
# Configuration
# ============================================

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

OFF_API_BASE = "https://world.openfoodfacts.org/cgi/search.pl"
OFF_TIMEOUT = 30
REQUEST_DELAY = 1.0

# ============================================
# Missing Products by Category
# ============================================

MISSING_PRODUCTS = {
    'dairy': [
        # מעדני חלב
        'דניאלה', 'דניאלה שוקולד', 'דניאלה וניל', 'דניאלה קרמל',
        'מילקי שוקולד', 'מילקי וניל', 'מילקי קרמל', 'מילקי עוגיות',
        'מעדן עלית', 'מעדן וניל', 'מעדן שוקולד לבן',
        'פטיט דנון', 'פטיט דנון תות', 'פטיט דנון שוקולד',
        'יופלה', 'יופלה תות', 'יופלה פירות יער', 'יופלה אפרסק',
        'אקטימל', 'אקטימל תות', 'אקטימל רימון',
        'ביו דנון', 'ביו פירות', 'ביו תות',
        'גו דנון', 'גו שוקולד', 'גו וניל',
        'פרי גו', 'פרוטי', 'פרוביוטיקה',
        'מוס וניל', 'מוס קפה', 'מוס לימון',
        'קרם ברולה', 'פנה קוטה', 'טירמיסו',
        'אורז בחלב', 'סולת בחלב', 'גרידת אורז',
        'גבינה מתוקה', 'לבנה מתוקה',
        'יוגורט אקטיביה טבעי', 'יוגורט דנונה',
        'שמנת מתוקה 38%', 'שמנת להקצפה 30%',
        'חלב 3% שקית', 'חלב 1% שקית',
        'גבינה צהובה 28%', 'גבינה צהובה 22%',
        'גבינה לבנה 9%', 'גבינה לבנה 3%',
        'קוטג 3%', 'קוטג 0%',
    ],
    'snacks': [
        'קינדר בואנו', 'קינדר שוקולד', 'קינדר סרפרייז',
        'פסק זמן', 'פסק זמן לבן', 'פסק זמן אגוזים',
        'טוויקס', 'מארס', 'באונטי', 'סניקרס',
        'קליק', 'קליק מריר', 'קליק לבן',
        'טורטית', 'רושקה', 'כדורגל',
        'במבה אדומה', 'במבה ממולאת',
        'ביסלי ברביקיו', 'ביסלי פלאפל',
        'תפוצ\'יפס', 'דוריטוס צ\'ילי',
        'עוגיות אוראו', 'עוגיות ביסקוויט',
        'שוקולד מריר 70%', 'שוקולד פרווה',
        'חלווה', 'חלווה שוקולד',
        'גרעינים', 'גרעיני חמניה',
    ],
    'drinks': [
        'קפוצינו', 'לאטה', 'אייס קפה',
        'פיוז טי אפרסק', 'פיוז טי לימון',
        'נסטי אפרסק', 'נסטי לימון', 'נסטי מנגו',
        'ליפטון תה קר', 'ליפטון ירוק',
        'XL אנרג\'י', 'רד בול', 'מוסטר',
        'שוופס לימון', 'שוופס ענבים',
        'קריסטל מים', 'מי עדן', 'נביעות פלוס',
        'מיץ פריגת', 'מיץ ענבים טבעי',
        'קולה דיאט', 'קולה זירו', 'פפסי מקס',
        'סודה סטרים', 'טוניק',
    ],
    'bread': [
        'לחם קל', 'לחם קל חיטה מלאה',
        'לחם פרוסות דקות', 'לחם סנדוויץ\'',
        'לחמניות המבורגר', 'לחמניות נקניקיה',
        'לחם בריוש', 'לחם חלה מתוקה',
        'באגט קפוא', 'באגט טרי',
        'פיתה גדולה', 'פיתה קטנה',
        'טורטיה גדולה', 'טורטיה קטנה',
        'לחם שום', 'לחם זיתים',
        'קרואסון חמאה', 'קרואסון שוקולד', 'קרואסון שקדים',
        'עוגת שמרים', 'רולדין קינמון',
        'לחם כפרי', 'לחם איטלקי',
    ],
    'frozen': [
        'פיצה משפחתית', 'פיצה אישית', 'פיצה מרגריטה',
        'שניצלונים', 'נאגטס', 'פופקורן צ\'יקן',
        'בורקס גבינה', 'בורקס תפו"א', 'בורקס פטריות',
        'מגנום', 'מגנום שקדים', 'מגנום לבן',
        'קורנטו', 'קורנטו שוקולד',
        'גולדה', 'גולדה וניל', 'גולדה שוקולד',
        'ארטיק', 'ארטיק ענבים',
        'פירות קפואים', 'תותים קפואים', 'פירות יער קפואים',
        'ירקות מוקפצים', 'ירקות לווק',
        'שווארמה קפואה', 'קבב קפוא',
        'פלאפל קפוא', 'חומוס קפוא',
    ],
    'cleaning': [
        'אקונומיקה לימון', 'אקונומיקה לבנדר',
        'נוזל כלים פיירי', 'נוזל כלים סנו',
        'מרכך סנו', 'מרכך מקסימה',
        'אבקת כביסה פרסיל', 'אבקת כביסה אריאל',
        'ג\'ל כביסה', 'קפסולות כביסה',
        'מסיר שומנים', 'מסיר אבנית',
        'מטליות לחות', 'מטליות רצפה',
        'שקיות זבל גדולות', 'שקיות זבל קטנות',
    ],
    'hygiene': [
        'סבון דאב', 'סבון פלמוליב',
        'שמפו הד אנד שולדרס', 'שמפו פנטן',
        'מרכך פנטן', 'מרכך גרנייה',
        'ג\'ל רחצה ניוואה', 'ג\'ל רחצה דאב',
        'דאודורנט רקסונה', 'דאודורנט ניוואה',
        'משחת שיניים קולגייט', 'משחת שיניים סנסודיין',
        'מברשת שיניים חשמלית', 'חוט דנטלי',
        'קרם ידיים', 'קרם פנים ניוואה',
    ],
}


# ============================================
# Helper Functions
# ============================================

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def is_valid_barcode(barcode: str) -> bool:
    if not barcode or not barcode.isdigit():
        return False
    length = len(barcode)
    if length == 13:
        total = sum(int(d) * (1 if i % 2 == 0 else 3) for i, d in enumerate(barcode[:12]))
        return (10 - (total % 10)) % 10 == int(barcode[12])
    elif length == 8:
        total = sum(int(d) * (3 if i % 2 == 0 else 1) for i, d in enumerate(barcode[:7]))
        return (10 - (total % 10)) % 10 == int(barcode[7])
    return False


def search_barcode(product_name: str) -> str:
    """Search Open Food Facts for barcode."""
    try:
        params = {
            'search_terms': product_name,
            'search_simple': 1,
            'action': 'process',
            'json': 1,
            'countries_tags_en': 'israel',
            'page_size': 5,
            'fields': 'code,product_name,product_name_he'
        }
        response = requests.get(OFF_API_BASE, params=params, timeout=OFF_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            for p in data.get('products', []):
                barcode = p.get('code', '')
                if is_valid_barcode(barcode):
                    return barcode
    except Exception:
        pass
    return None


# ============================================
# Main Functions
# ============================================

def remove_duplicates(supabase: Client) -> int:
    """Remove duplicate products, keeping first occurrence."""
    print("\n" + "=" * 60)
    print("שלב 1: מחיקת כפילויות")
    print("=" * 60)

    products = supabase.table('products').select('id, name, category').order('id').execute()

    seen_names: Set[str] = set()
    duplicates_to_delete: List[int] = []

    for p in products.data:
        name = p['name']
        if name in seen_names:
            duplicates_to_delete.append(p['id'])
        else:
            seen_names.add(name)

    if not duplicates_to_delete:
        print("✅ לא נמצאו כפילויות")
        return 0

    print(f"נמצאו {len(duplicates_to_delete)} כפילויות למחיקה")

    # Delete prices first, then products
    deleted = 0
    for product_id in duplicates_to_delete:
        try:
            # First delete associated prices
            supabase.table('prices').delete().eq('product_id', product_id).execute()
            # Then delete the product
            supabase.table('products').delete().eq('id', product_id).execute()
            deleted += 1
            if deleted % 10 == 0:
                print(f"  נמחקו {deleted}/{len(duplicates_to_delete)}...")
        except Exception as e:
            print(f"  שגיאה במחיקת {product_id}: {e}")

    print(f"✅ נמחקו {deleted} כפילויות")
    return deleted


def add_missing_products(supabase: Client) -> int:
    """Add missing products with barcodes from Open Food Facts."""
    print("\n" + "=" * 60)
    print("שלב 2: הוספת מוצרים חסרים")
    print("=" * 60)

    # Get existing product names
    existing = supabase.table('products').select('name').execute()
    existing_names = {p['name'] for p in existing.data}

    # Get existing barcodes
    existing_barcodes = supabase.table('products').select('barcode').execute()
    used_barcodes = {p['barcode'] for p in existing_barcodes.data if p.get('barcode')}

    added = 0
    total_to_add = sum(len([p for p in products if p not in existing_names])
                       for products in MISSING_PRODUCTS.values())

    print(f"מוצרים חסרים לבדיקה: ~{total_to_add}")

    for category, products in MISSING_PRODUCTS.items():
        missing = [p for p in products if p not in existing_names]

        if not missing:
            continue

        print(f"\n📁 {category}: {len(missing)} חסרים")

        for product_name in missing:
            # Rate limiting
            time.sleep(REQUEST_DELAY)

            # Search for barcode
            barcode = search_barcode(product_name)

            if barcode and barcode in used_barcodes:
                print(f"  ⚠️ {product_name}: ברקוד כבר בשימוש")
                continue

            try:
                supabase.table('products').insert({
                    'name': product_name,
                    'category': category,
                    'barcode': barcode
                }).execute()

                if barcode:
                    used_barcodes.add(barcode)
                    print(f"  ✅ {product_name} ({barcode})")
                else:
                    print(f"  ➕ {product_name} (ללא ברקוד)")

                added += 1
                existing_names.add(product_name)

            except Exception as e:
                print(f"  ❌ {product_name}: {e}")

    print(f"\n✅ נוספו {added} מוצרים חדשים")
    return added


def main():
    print("=" * 60)
    print("ListNest Database Fixer")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase")
    except ValueError as e:
        print(f"❌ {e}")
        return 1

    # Step 1: Remove duplicates
    deleted = remove_duplicates(supabase)

    # Step 2: Add missing products
    added = add_missing_products(supabase)

    # Summary
    print("\n" + "=" * 60)
    print("סיכום")
    print("=" * 60)
    print(f"כפילויות שנמחקו: {deleted}")
    print(f"מוצרים שנוספו: {added}")

    # Final count
    final = supabase.table('products').select('id', count='exact').execute()
    print(f"סה\"כ מוצרים בדאטהבייס: {final.count}")

    print("\n" + "=" * 60)
    print(f"Finished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    return 0


if __name__ == '__main__':
    exit(main())
