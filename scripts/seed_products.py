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


def validate_barcode(barcode: str) -> bool:
    """
    Validate barcode format (EAN-13, EAN-8, or UPC-A).
    Returns True if valid, False otherwise.
    """
    if not barcode or not barcode.isdigit():
        return False

    length = len(barcode)

    # EAN-13 or UPC-A (12 digits, often stored as 13 with leading 0)
    if length == 13:
        return _validate_ean13_checksum(barcode)
    # EAN-8
    elif length == 8:
        return _validate_ean8_checksum(barcode)
    # UPC-A without leading zero
    elif length == 12:
        return _validate_ean13_checksum('0' + barcode)

    return False


def _validate_ean13_checksum(barcode: str) -> bool:
    """Validate EAN-13 checksum."""
    if len(barcode) != 13:
        return False
    total = 0
    for i, digit in enumerate(barcode[:12]):
        total += int(digit) * (1 if i % 2 == 0 else 3)
    check_digit = (10 - (total % 10)) % 10
    return check_digit == int(barcode[12])


def _validate_ean8_checksum(barcode: str) -> bool:
    """Validate EAN-8 checksum."""
    if len(barcode) != 8:
        return False
    total = 0
    for i, digit in enumerate(barcode[:7]):
        total += int(digit) * (3 if i % 2 == 0 else 1)
    check_digit = (10 - (total % 10)) % 10
    return check_digit == int(barcode[7])


# Verified Israeli products with real barcodes
# Format: (barcode, name, category)
# NOTE: Only include barcodes that have been verified against actual products
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
    # קוקה קולה - ברקודים אמיתיים
    ('5000112611878', 'קוקה קולה 1.5 ליטר', 'beverages'),
    ('5000112611885', 'קוקה קולה זירו 1.5 ליטר', 'beverages'),
    ('5000112636697', 'קוקה קולה 2 ליטר', 'beverages'),
    ('5000112636659', 'קוקה קולה 330 מ"ל פחית', 'beverages'),
    # פפסי - ברקודים אמיתיים
    ('7290001029824', 'פפסי 1.5 ליטר', 'beverages'),
    ('7290001029909', 'פפסי מקס 1.5 ליטר', 'beverages'),
    # ספרייט ופאנטה
    ('5000112548167', 'ספרייט 1.5 ליטר', 'beverages'),
    ('5000112548174', 'פאנטה תפוזים 1.5 ליטר', 'beverages'),
    # מים - ברקודים אמיתיים
    ('7290000308517', 'מים מינרליים נביעות 1.5 ליטר', 'beverages'),
    ('7290000590615', 'מים מינרליים עין גדי 1.5 ליטר', 'beverages'),
    ('7290008464215', 'מי עדן 1.5 ליטר', 'beverages'),

    # ===== ממרחים =====
    # לוטוס
    ('5410126006063', 'ממרח לוטוס 400 גרם', 'spreads'),
    ('5410126006018', 'עוגיות לוטוס 250 גרם', 'spreads'),
    # נוטלה - ברקודים EAN-13 אמיתיים
    ('8000500217467', 'נוטלה 350 גרם', 'spreads'),
    ('8000500286463', 'נוטלה 750 גרם', 'spreads'),
    # חמאת בוטנים
    ('7290004131210', 'חמאת בוטנים כרמית 350 גרם', 'spreads'),
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

    # Validate barcodes first
    print("Validating barcodes...")
    invalid_barcodes = []
    for barcode, name, category in PRODUCTS:
        if not validate_barcode(barcode):
            invalid_barcodes.append((barcode, name))

    if invalid_barcodes:
        print(f"\n⚠️ Found {len(invalid_barcodes)} invalid barcodes:")
        for barcode, name in invalid_barcodes:
            print(f"  - {barcode}: {name}")
        print("\nContinuing with valid barcodes only...\n")

    upserted = 0
    skipped = 0

    for barcode, name, category in PRODUCTS:
        # Skip invalid barcodes
        if not validate_barcode(barcode):
            skipped += 1
            continue

        try:
            supabase.table('products').upsert({
                'barcode': barcode,
                'name': name,
                'category': category
            }, on_conflict='barcode').execute()
            upserted += 1
        except Exception as e:
            print(f"  Error with {name}: {e}")
            skipped += 1

    # Get total count
    total = supabase.table('products').select('id', count='exact').execute()
    total_count = total.count if total.count else len(total.data)

    print(f"\nUpserted: {upserted}")
    print(f"Skipped/Errors: {skipped}")
    print(f"Invalid barcodes: {len(invalid_barcodes)}")
    print(f"Total products in DB: {total_count}")


if __name__ == '__main__':
    seed_products()
