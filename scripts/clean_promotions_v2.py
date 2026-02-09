#!/usr/bin/env python3
"""
Promotion Cleaner V2 - More aggressive cleaning
"""

import os
import re
from supabase import create_client

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

# Words/patterns that indicate promotion should be DELETED
DELETE_PATTERNS = [
    'לא רלוונטי',
    'שילוט',
    'החלטה',
    'פנימי',
    'internal',
    'test',
    'dummy',
    'sample',
    'display',
    'תצוגה',
    'עגלה',
    'סל קניות',
    'cart',
    'trolley',
    'מדבקה',
    'תווית',
    'label',
    'sticker',
    'קופון',
    'coupon',
    'gift card',
    'מסננת נירוסטה',  # Specific item from examples
    'קופונים למצטרפים',  # Coupons for new members
]

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def should_delete(description):
    """Check if promotion should be deleted"""
    desc_lower = description.lower()
    for pattern in DELETE_PATTERNS:
        if pattern.lower() in desc_lower:
            return True
    # Delete very short or very long descriptions
    if len(description.strip()) < 5 or len(description.strip()) > 200:
        return True
    return False

def clean_description(desc):
    """Clean and format a promotion description"""
    cleaned = desc.strip()

    # Remove trailing "-ישיר" or "-ישי" patterns
    cleaned = re.sub(r'-?\s*ישי[רב]?$', '', cleaned)
    cleaned = re.sub(r'-?\s*ישיר$', '', cleaned)

    # Format "XבY" to "X ב-Y₪" (e.g., "2ב22" -> "2 ב-22₪")
    cleaned = re.sub(r'(\d+)\s*ב\s*(\d+(?:\.\d+)?)\s*(?:ש["\']?:?)?$', r'\1 ב-\2₪', cleaned)
    cleaned = re.sub(r'^(\d+)\s*ב\s*(\d+(?:\.\d+)?)\s+', r'\1 ב-\2₪ ', cleaned)

    # Format "X ב Y" to "X ב-Y₪"
    cleaned = re.sub(r'(\d+)\s+ב\s+(\d+(?:\.\d+)?)\s*$', r'\1 ב-\2₪', cleaned)

    # Add ₪ after standalone prices at the end
    cleaned = re.sub(r'\s+(\d+\.\d{2})\s*$', r' \1₪', cleaned)
    cleaned = re.sub(r'\s+ב-?(\d+(?:\.\d+)?)\s*$', r' ב-\1₪', cleaned)

    # Clean "ש:" at end (שקל abbreviation)
    cleaned = re.sub(r'\s*ש:?\s*$', '₪', cleaned)

    # Remove duplicate ₪
    cleaned = re.sub(r'₪+', '₪', cleaned)

    # Remove leading special chars
    cleaned = re.sub(r'^[\^*#]+\s*', '', cleaned)

    # Clean up multiple spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    # Remove trailing punctuation except ₪
    cleaned = re.sub(r'[,;:\-\+]+$', '', cleaned).strip()

    return cleaned

def process_promotions():
    """Main processing function"""
    print("=" * 60)
    print("Promotion Cleaner V2 (Aggressive Mode)")
    print("=" * 60)

    supabase = get_supabase()

    # Get all promotions
    print("\nFetching promotions...")
    all_promos = []
    offset = 0
    while True:
        batch = supabase.table('promotions').select('id,description,chain_id').range(offset, offset + 999).execute().data
        if not batch:
            break
        all_promos.extend(batch)
        offset += 1000

    print(f"Found {len(all_promos)} promotions")

    # Phase 1: Delete irrelevant
    print("\n[Phase 1] Deleting irrelevant promotions...")
    deleted = 0
    remaining = []

    for promo in all_promos:
        if should_delete(promo['description']):
            try:
                supabase.table('promotions').delete().eq('id', promo['id']).execute()
                deleted += 1
            except Exception as e:
                print(f"  Error deleting: {e}")
        else:
            remaining.append(promo)

    print(f"  Deleted: {deleted}")

    # Phase 2: Clean and format
    print("\n[Phase 2] Cleaning and formatting...")
    updated = 0

    for promo in remaining:
        original = promo['description']
        cleaned = clean_description(original)

        if cleaned != original and len(cleaned) >= 5:
            try:
                supabase.table('promotions').update({'description': cleaned}).eq('id', promo['id']).execute()
                updated += 1
            except Exception as e:
                print(f"  Error updating: {e}")

    print(f"  Updated: {updated}")

    # Final count
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)

    # Count per chain
    for chain_id in [1, 2, 3, 4, 5, 6]:
        chain_names = {1: 'שופרסל', 2: 'רמי לוי', 3: 'יינות ביתן', 4: 'ויקטורי', 5: 'חצי חינם', 6: 'קרפור'}
        try:
            result = supabase.table('promotions').select('id', count='exact').eq('chain_id', chain_id).execute()
            count = len(result.data) if result.data else 0
            print(f"  {chain_names.get(chain_id, chain_id)}: {count} מבצעים")
        except:
            pass

    print("=" * 60)

if __name__ == '__main__':
    process_promotions()
