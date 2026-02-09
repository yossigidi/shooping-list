#!/usr/bin/env python3
"""
Clean and format promotions - Smart local cleaning + AI for translation
"""

import os
import re
import json
import time
import requests
from supabase import create_client

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')

# Words that indicate non-relevant promotions (to DELETE)
DELETE_WORDS = [
    'שילוט', 'החלטה', 'פנימי', 'מבחן', 'דוגמא', 'תצוגה',
    'internal', 'test', 'sample', 'display', 'dummy',
    'עגלה', 'סל קניות', 'שקית נשיאה', 'cart', 'trolley',
    'קופון', 'coupon', 'voucher', 'gift card',
    'תווית', 'label', 'sticker', 'tag',
    'מדבקה', 'סימון', 'marking',
]

# Patterns to clean from descriptions
CLEAN_PATTERNS = [
    (r'^\d{8,}[-\s]*', ''),           # Remove leading barcodes
    (r'[-\s]*\d{8,}$', ''),           # Remove trailing barcodes
    (r'^[A-Z0-9]{6,}[-\s]*', ''),     # Remove leading codes
    (r'\s*[-]\s*\d{6,}$', ''),        # Remove trailing codes
    (r'\s{2,}', ' '),                  # Multiple spaces to single
    (r'^\s+|\s+$', ''),               # Trim
]

# Hebrew formatting rules
FORMAT_RULES = [
    # "ב X ב Y" -> "X ב-Y₪"
    (r'ב\.?\s*(\d+)\s*ב\.?\s*(\d+(?:\.\d+)?)', r'\1 ב-\2₪'),
    # "קנה X קבל Y" patterns
    (r'קנה\s*(\d+)\s*קבל\s*(\d+)', r'קנה \1 קבל \2'),
    # Add ₪ if missing after price
    (r'(\d+(?:\.\d+)?)\s*ש"ח', r'\1₪'),
    (r'(\d+(?:\.\d+)?)\s*שח', r'\1₪'),
    (r'ב-?(\d+(?:\.\d+)?)\s*$', r'ב-\1₪'),
]

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def should_delete(description):
    """Check if promotion should be deleted"""
    desc_lower = description.lower()
    for word in DELETE_WORDS:
        if word.lower() in desc_lower:
            return True
    # Also delete very short descriptions
    if len(description.strip()) < 5:
        return True
    return False

def is_english(text):
    """Check if text is primarily English"""
    english_chars = sum(1 for c in text if c.isalpha() and ord(c) < 128)
    hebrew_chars = sum(1 for c in text if '\u0590' <= c <= '\u05FF')
    total_chars = english_chars + hebrew_chars
    if total_chars == 0:
        return False
    return english_chars > hebrew_chars

def clean_locally(description):
    """Clean description without AI"""
    cleaned = description.strip()

    # Apply cleaning patterns
    for pattern, replacement in CLEAN_PATTERNS:
        cleaned = re.sub(pattern, replacement, cleaned)

    # Apply formatting rules
    for pattern, replacement in FORMAT_RULES:
        cleaned = re.sub(pattern, replacement, cleaned)

    return cleaned.strip()

def translate_batch_with_ai(descriptions):
    """Translate English descriptions to Hebrew using Groq"""
    if not GROQ_API_KEY or not descriptions:
        return None

    prompt = """תרגם את המבצעים הבאים לעברית. שמור על הפורמט: "מוצר - כמות ב-מחיר"
אם כבר בעברית, רק נקה ופרמט.

מבצעים:
"""
    for i, desc in enumerate(descriptions):
        prompt += f"{i+1}. {desc}\n"

    prompt += "\nהחזר JSON array עם התרגומים. דוגמה: [\"מבצע 1\", \"מבצע 2\"]"

    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {GROQ_API_KEY}'
            },
            json={
                'model': 'llama-3.1-8b-instant',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.1,
                'max_tokens': 2000
            },
            timeout=30
        )

        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']

            # Parse JSON
            start = content.find('[')
            end = content.rfind(']') + 1
            if start >= 0 and end > start:
                return json.loads(content[start:end])
        elif response.status_code == 429:
            print("    Rate limited, waiting...")
            time.sleep(10)
            return None
        else:
            print(f"    API error: {response.status_code}")

    except Exception as e:
        print(f"    Error: {e}")

    return None

def process_promotions():
    """Main processing function"""
    print("=" * 60)
    print("Promotion Cleaner (Smart Mode)")
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

    # Phase 1: Delete irrelevant promotions
    print("\n[Phase 1] Deleting irrelevant promotions...")
    deleted = 0
    for promo in all_promos:
        if should_delete(promo['description']):
            try:
                supabase.table('promotions').delete().eq('id', promo['id']).execute()
                deleted += 1
            except:
                pass
    print(f"  Deleted: {deleted}")

    # Refresh list
    all_promos = [p for p in all_promos if not should_delete(p['description'])]

    # Phase 2: Local cleaning
    print("\n[Phase 2] Local cleaning...")
    updated = 0
    english_promos = []

    for promo in all_promos:
        cleaned = clean_locally(promo['description'])

        if cleaned != promo['description']:
            try:
                supabase.table('promotions').update({'description': cleaned}).eq('id', promo['id']).execute()
                updated += 1
                promo['description'] = cleaned  # Update local copy
            except:
                pass

        # Collect English promotions for AI translation
        if is_english(cleaned):
            english_promos.append(promo)

    print(f"  Updated: {updated}")
    print(f"  English promotions found: {len(english_promos)}")

    # Phase 3: AI Translation (only for English)
    if english_promos and GROQ_API_KEY:
        print("\n[Phase 3] AI Translation of English promotions...")
        batch_size = 10
        translated = 0

        for i in range(0, len(english_promos), batch_size):
            batch = english_promos[i:i + batch_size]
            descriptions = [p['description'] for p in batch]

            print(f"  Batch {i//batch_size + 1}/{(len(english_promos) + batch_size - 1)//batch_size}")

            translations = translate_batch_with_ai(descriptions)

            if translations and len(translations) == len(batch):
                for j, promo in enumerate(batch):
                    if translations[j] and translations[j] != promo['description']:
                        try:
                            supabase.table('promotions').update({'description': translations[j]}).eq('id', promo['id']).execute()
                            translated += 1
                        except:
                            pass

            # Rate limiting - wait between batches
            time.sleep(3)

        print(f"  Translated: {translated}")
    elif not GROQ_API_KEY:
        print("\n[Phase 3] Skipped - no GROQ_API_KEY")

    # Final count
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)

    final_count = supabase.table('promotions').select('id', count='exact').execute()
    print(f"  Total promotions remaining: {len(final_count.data) if final_count.data else 'unknown'}")
    print("=" * 60)

if __name__ == '__main__':
    process_promotions()
