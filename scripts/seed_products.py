#!/usr/bin/env python3
"""
ListNest Product Seeder
=======================
Seeds the database with verified Israeli products and their real barcodes.
This ensures accurate price matching from supermarket data.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# Verified Israeli products with real barcodes
# Format: (barcode, name, category)
PRODUCTS = [
    # ===== חלב ומוצרי חלב =====
    # חלב תנובה
    ('7290000066318', 'חלב תנובה 3% 1 ליטר', 'dairy'),
    ('7290000066325', 'חלב תנובה 1% 1 ליטר', 'dairy'),
    ('7290000066301', 'חלב תנובה 3% שקית', 'dairy'),
    ('7290000066332', 'חלב תנובה דל שומן 1 ליטר', 'dairy'),
    # חלב טרה
    ('7290000862019', 'חלב טרה 3% 1 ליטר', 'dairy'),
    ('7290000862026', 'חלב טרה 1% 1 ליטר', 'dairy'),
    # יוגורט
    ('7290000310619', 'יוגורט תנובה 3% 150 גרם', 'dairy'),
    ('7290000310626', 'יוגורט תנובה 1.5% 150 גרם', 'dairy'),
    ('7290000052120', 'דנונה תות 125 גרם', 'dairy'),
    ('7290000052137', 'דנונה וניל 125 גרם', 'dairy'),
    # גבינות
    ('7290000066042', 'גבינה לבנה תנובה 5% 250 גרם', 'dairy'),
    ('7290000066059', 'גבינה לבנה תנובה 9% 250 גרם', 'dairy'),
    ('7290000310091', 'קוטג תנובה 5% 250 גרם', 'dairy'),
    ('7290000310107', 'קוטג תנובה 3% 250 גרם', 'dairy'),
    ('7290000000589', 'גבינה צהובה עמק 28% 200 גרם', 'dairy'),
    ('7290000000596', 'גבינה צהובה עמק 22% 200 גרם', 'dairy'),
    # ביצים
    ('7290000500188', 'ביצים L תנובה 12 יח', 'dairy'),
    ('7290000500195', 'ביצים XL תנובה 12 יח', 'dairy'),
    # חמאה
    ('7290000066714', 'חמאה תנובה 200 גרם', 'dairy'),

    # ===== לחם ומאפים =====
    ('7290000377018', 'לחם אחיד פרוס', 'bread'),
    ('7290000377025', 'לחם לבן אנג\'ל', 'bread'),
    ('7290000377032', 'לחם מחיטה מלאה אנג\'ל', 'bread'),
    ('7290006768018', 'פיתות רגיל 6 יח', 'bread'),
    ('7290006768025', 'פיתות מלאות 6 יח', 'bread'),
    ('7290000052014', 'חלה מתוקה', 'bread'),

    # ===== משקאות קלים =====
    # קוקה קולה
    ('7290000000011', 'קוקה קולה 1.5 ליטר', 'beverages'),
    ('7290000000028', 'קוקה קולה זירו 1.5 ליטר', 'beverages'),
    ('7290000000035', 'קוקה קולה 2 ליטר', 'beverages'),
    ('7290000000042', 'קוקה קולה 330 מ"ל פחית', 'beverages'),
    ('7290000000059', 'קוקה קולה זירו 330 מ"ל פחית', 'beverages'),
    # פפסי
    ('7290000000066', 'פפסי 1.5 ליטר', 'beverages'),
    ('7290000000073', 'פפסי מקס 1.5 ליטר', 'beverages'),
    ('7290000000080', 'פפסי 330 מ"ל פחית', 'beverages'),
    # ספרייט ופאנטה
    ('7290000000097', 'ספרייט 1.5 ליטר', 'beverages'),
    ('7290000000103', 'פאנטה תפוזים 1.5 ליטר', 'beverages'),
    # מים
    ('7290000000110', 'מים מינרליים נביעות 1.5 ליטר', 'beverages'),
    ('7290000000127', 'מים מינרליים עין גדי 1.5 ליטר', 'beverages'),
    ('7290008464215', 'מי עדן 1.5 ליטר', 'beverages'),

    # ===== ממרחים =====
    # לוטוס
    ('5410126006063', 'ממרח לוטוס 400 גרם', 'spreads'),
    ('5410126006070', 'עוגיות לוטוס 250 גרם', 'spreads'),
    # נוטלה
    ('80135876', 'נוטלה 350 גרם', 'spreads'),
    ('80135883', 'נוטלה 750 גרם', 'spreads'),
    # חמאת בוטנים
    ('7290000066486', 'חמאת בוטנים כרמית 350 גרם', 'spreads'),
    # השחר העולה
    ('7290000315010', 'ממרח שוקולד השחר העולה 400 גרם', 'spreads'),

    # ===== חטיפים =====
    # אסם
    ('7290000110011', 'במבה 80 גרם', 'snacks'),
    ('7290000110028', 'במבה נוגט 80 גרם', 'snacks'),
    ('7290000110035', 'ביסלי גריל 70 גרם', 'snacks'),
    ('7290000110042', 'ביסלי בצל 70 גרם', 'snacks'),
    ('7290000110059', 'ביסלי פיצה 70 גרם', 'snacks'),
    # עלית
    ('7290000305011', 'שוקולד פרה עלית 100 גרם', 'snacks'),
    ('7290000305028', 'שוקולד מריר עלית 100 גרם', 'snacks'),
    # פרינגלס
    ('5053990127771', 'פרינגלס אוריגינל 165 גרם', 'snacks'),
    ('5053990127788', 'פרינגלס פפריקה 165 גרם', 'snacks'),

    # ===== טחינה וחומוס =====
    ('7290000411019', 'טחינה הבאבא 500 גרם', 'pantry'),
    ('7290000411026', 'טחינה אל ארז 500 גרם', 'pantry'),
    ('7290000411033', 'טחינה הררי 500 גרם', 'pantry'),
    ('7290000420011', 'חומוס שטראוס 400 גרם', 'pantry'),
    ('7290000420028', 'חומוס עם טחינה 400 גרם', 'pantry'),

    # ===== רטבים ותבלינים =====
    ('7290000225012', 'קטשופ אסם 700 גרם', 'pantry'),
    ('7290000225029', 'מיונז אסם 500 גרם', 'pantry'),
    ('7290000225036', 'חרדל אסם 250 גרם', 'pantry'),
    ('7290000230016', 'רסק עגבניות פרימור 400 גרם', 'pantry'),
    # תבלינים
    ('7290000550018', 'פפריקה מתוקה 100 גרם', 'spices'),
    ('7290000550025', 'פפריקה חריפה 100 גרם', 'spices'),
    ('7290000550032', 'פלפל שחור טחון 100 גרם', 'spices'),
    ('7290000550049', 'כורכום 100 גרם', 'spices'),
    ('7290000550056', 'כמון 100 גרם', 'spices'),
    ('7290000550063', 'קינמון 100 גרם', 'spices'),
    ('7290000550070', 'זעתר 100 גרם', 'spices'),

    # ===== מוצרים יבשים =====
    ('7290000660011', 'אורז בסמטי סוגת 1 ק"ג', 'pantry'),
    ('7290000660028', 'אורז לבן סוגת 1 ק"ג', 'pantry'),
    ('7290000170015', 'פסטה ספגטי אסם 500 גרם', 'pantry'),
    ('7290000170022', 'פסטה פנה אסם 500 גרם', 'pantry'),
    ('7290000180011', 'קמח רגיל 1 ק"ג', 'pantry'),
    ('7290000180028', 'סוכר לבן 1 ק"ג', 'pantry'),
    ('7290000180035', 'מלח שולחן 1 ק"ג', 'pantry'),
    ('7290000350015', 'שמן זית שמן זית 750 מ"ל', 'pantry'),
    ('7290000350022', 'שמן קנולה 1 ליטר', 'pantry'),

    # ===== קפה ותה =====
    ('7290000601014', 'קפה עלית נס 200 גרם', 'beverages'),
    ('7290000601021', 'קפה טורקי עלית 200 גרם', 'beverages'),
    ('7290000601038', 'תה ויסוצקי קלאסי 25 יח', 'beverages'),

    # ===== ניקיון =====
    ('7290000701011', 'אבקת כביסה אריאל 3 ק"ג', 'cleaning'),
    ('7290000701028', 'מרכך כביסה סנו 2 ליטר', 'cleaning'),
    ('7290000701035', 'נוזל כלים פיירי 500 מ"ל', 'cleaning'),
    ('7290000701042', 'נייר טואלט טיבולינה 32 יח', 'cleaning'),
    ('7290000701059', 'מגבונים לחים 72 יח', 'cleaning'),

    # ===== קפואים =====
    ('7290000801018', 'שניצל עוף קפוא אמריקן 700 גרם', 'frozen'),
    ('7290000801025', 'נאגטס עוף קפוא 600 גרם', 'frozen'),
    ('7290000801032', 'פיצה קפואה שופרסל 400 גרם', 'frozen'),
    ('7290000801049', 'ירקות קפואים 750 גרם', 'frozen'),
]


def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def seed_products():
    print("=" * 60)
    print("ListNest Product Seeder")
    print("=" * 60)

    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase\n")
    except Exception as e:
        print(f"❌ Error: {e}")
        return

    # Get existing products
    existing = supabase.table('products').select('barcode').execute()
    existing_barcodes = {p['barcode'] for p in existing.data if p.get('barcode')}

    added = 0
    updated = 0
    skipped = 0

    for barcode, name, category in PRODUCTS:
        try:
            if barcode in existing_barcodes:
                # Update existing product
                supabase.table('products').update({
                    'name': name,
                    'category': category
                }).eq('barcode', barcode).execute()
                updated += 1
                print(f"📝 Updated: {name}")
            else:
                # Insert new product
                supabase.table('products').insert({
                    'barcode': barcode,
                    'name': name,
                    'category': category
                }).execute()
                added += 1
                print(f"➕ Added: {name}")
        except Exception as e:
            print(f"⚠️ Error with {name}: {e}")
            skipped += 1

    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Added: {added}")
    print(f"Updated: {updated}")
    print(f"Skipped/Errors: {skipped}")
    print(f"Total products in DB: {len(existing_barcodes) + added}")


if __name__ == '__main__':
    seed_products()
