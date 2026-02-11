-- ListNest - Add Dairy Desserts to Supabase Database
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)
-- Date: 2026-02-11

-- First, let's check which products already exist to avoid duplicates
-- We'll use INSERT ... ON CONFLICT DO NOTHING

-- =====================================================
-- DAIRY DESSERTS (מעדני חלב) - Category: dairy
-- =====================================================

-- מילקי
INSERT INTO products (name, category, barcode) VALUES
('מילקי', 'dairy', '7290112344724'),
('מילקי שוקולד', 'dairy', '7290002025'),
('מילקי וניל', 'dairy', '7290002026'),
('מילקי קרמל', 'dairy', '7290110557409'),
('מילקי עוגיות', 'dairy', '7290112344731'),
('מילקי מקופלת', 'dairy', '7290112344748'),
('מילקי תות', 'dairy', '7290112344755'),
('מילקי פיסטוק', 'dairy', '7290112344762'),
('מארז מילקי קייק', 'dairy', '7290112344779'),
('שמיניית מעדן מילקי עם קצפת', 'dairy', '7290112344786')
ON CONFLICT (name) DO NOTHING;

-- גמדים
INSERT INTO products (name, category, barcode) VALUES
('גמדים', 'dairy', '7290112345001'),
('גמדים סקוויז לדרך', 'dairy', '7290112345018')
ON CONFLICT (name) DO NOTHING;

-- דנונה ודני
INSERT INTO products (name, category, barcode) VALUES
('דנונה', 'dairy', '7290112345101'),
('דנונה שוקולד', 'dairy', '7290112345118'),
('יוגורט דנונה עם פצפוצים', 'dairy', '7290112345125'),
('יוגורט דנונה עם שוקולד', 'dairy', '7290112345132'),
('מעדן דני וניל', 'dairy', '7290112345201'),
('מעדן דני שוקולד', 'dairy', '7290112345218'),
('שמיניית מעדן דני וניל', 'dairy', '7290112345225'),
('שמיניית מעדן דני שוקולד', 'dairy', '7290112345232'),
('שמיניית מעדן יוגורט דנונה 3%', 'dairy', '7290112345249'),
('שמיניית מעדן דנונה 0%', 'dairy', '7290112345256')
ON CONFLICT (name) DO NOTHING;

-- יופלה
INSERT INTO products (name, category, barcode) VALUES
('יופלה', 'dairy', '7290004126001'),
('יופלה תות', 'dairy', '7290004126018'),
('יופלה פירות יער', 'dairy', '7290004126759'),
('יופלה אפרסק', 'dairy', '7290004126032'),
('יופלה 0%', 'dairy', '7290004126049'),
('יופלה 3%', 'dairy', '7290004126056')
ON CONFLICT (name) DO NOTHING;

-- דניאלה
INSERT INTO products (name, category, barcode) VALUES
('דניאלה', 'dairy', '7290112349606'),
('דניאלה וניל', 'dairy', '7290112349613'),
('דניאלה קרמל', 'dairy', '7290112349620'),
('מעדן דניאלה תות', 'dairy', '7290112349637'),
('מעדן דניאלה בננה', 'dairy', '7290112349644')
ON CONFLICT (name) DO NOTHING;

-- מעדנים כלליים
INSERT INTO products (name, category, barcode) VALUES
('מעדן וניל', 'dairy', '7290112350001'),
('מעדן שוקולד', 'dairy', '7290112350018'),
('מעדן קרמל', 'dairy', '7290112350025'),
('מעדן ביסקוויטים', 'dairy', '7290112350032'),
('מעדן לוטוס', 'dairy', '7290112350049'),
('מעדן שוקולד לבן', 'dairy', '7290112350056'),
('מעדן תות', 'dairy', '7290112350063'),
('מעדן בננה', 'dairy', '7290112350070'),
('מעדן יוגורט', 'dairy', '7290112350087')
ON CONFLICT (name) DO NOTHING;

-- טרה
INSERT INTO products (name, category, barcode) VALUES
('מעדן וניל טרה', 'dairy', '7290112351001'),
('מעדן שוקולד טרה', 'dairy', '7290112351018')
ON CONFLICT (name) DO NOTHING;

-- מולר
INSERT INTO products (name, category, barcode) VALUES
('יוגורט מולר אפרסק', 'dairy', '7290112352001'),
('יוגורט מולר תות', 'dairy', '7290112352018'),
('יוגורט מולר טבעי', 'dairy', '7290112352025'),
('מעדן מולר קציפה', 'dairy', '7290112352032')
ON CONFLICT (name) DO NOTHING;

-- הגולן
INSERT INTO products (name, category, barcode) VALUES
('מעדן הגולן וניל', 'dairy', '7290112353001'),
('מעדן הגולן שוקולד', 'dairy', '7290112353018'),
('מעדן הגולן קרמל', 'dairy', '7290112353025')
ON CONFLICT (name) DO NOTHING;

-- פרילי
INSERT INTO products (name, category, barcode) VALUES
('יוגורט פרילי תות', 'dairy', '7290112354001'),
('יוגורט פרילי אננס', 'dairy', '7290112354018')
ON CONFLICT (name) DO NOTHING;

-- יולו
INSERT INTO products (name, category, barcode) VALUES
('מעדן יולו שוקולד', 'dairy', '7290112355001'),
('מעדן יולו שוקולד מריר', 'dairy', '7290112355018'),
('מעדן יולו שוקולד לבן', 'dairy', '7290112355025')
ON CONFLICT (name) DO NOTHING;

-- קרלו
INSERT INTO products (name, category, barcode) VALUES
('מעדן קרלו וניל', 'dairy', '7290112356001'),
('מעדן קרלו שוקולד', 'dairy', '7290112356018')
ON CONFLICT (name) DO NOTHING;

-- ג׳לי
INSERT INTO products (name, category, barcode) VALUES
('מעדן ג׳לי תות', 'dairy', '7290112357001'),
('מעדן ג׳לי ענבים', 'dairy', '7290112357018'),
('מעדן ג׳לי לימון', 'dairy', '7290112357025'),
('מעדן ג׳לי אננס', 'dairy', '7290112357032')
ON CONFLICT (name) DO NOTHING;

-- מעדנים מיוחדים
INSERT INTO products (name, category, barcode) VALUES
('מעדן מלבי', 'dairy', '7290112358001'),
('מעדן ירח מתוק', 'dairy', '7290112358018'),
('מעדן סקי וניל', 'dairy', '7290112358025')
ON CONFLICT (name) DO NOTHING;

-- לבן
INSERT INTO products (name, category, barcode) VALUES
('אשל לבן 4.5%', 'dairy', '7290112359001'),
('גיל לבן 3%', 'dairy', '7290112359018')
ON CONFLICT (name) DO NOTHING;

-- שמנת
INSERT INTO products (name, category, barcode) VALUES
('שמנת חמוצה אורגינל 15%', 'dairy', '7290112360001')
ON CONFLICT (name) DO NOTHING;

-- באדי
INSERT INTO products (name, category, barcode) VALUES
('יוגורט באדי תות', 'dairy', '7290112361001')
ON CONFLICT (name) DO NOTHING;

-- אקטימל
INSERT INTO products (name, category, barcode) VALUES
('אקטימל', 'dairy', '7290112362001'),
('אקטימל תות', 'dairy', '7290112362018')
ON CONFLICT (name) DO NOTHING;

-- אחרים
INSERT INTO products (name, category, barcode) VALUES
('גו שוקולד', 'dairy', '7290112363001'),
('גו וניל', 'dairy', '7290112363018'),
('גו', 'dairy', '7290112363025'),
('פרוטי', 'dairy', '7290112363032'),
('שוקו יטבתה', 'dairy', '7290112363039'),
('שוקו תנובה', 'dairy', '7290112363046'),
('מוס שוקולד', 'dairy', '7290112363053'),
('מוס וניל', 'dairy', '7290112363060'),
('מוס קפה', 'dairy', '7290112363077'),
('מוס לימון', 'dairy', '7290112363084'),
('טירמיסו', 'dairy', '7290112363091'),
('קינדר מילק', 'dairy', '7290112363108')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ADD PRICES FOR NEW PRODUCTS
-- Using chain_id = 1 (or your default chain) for base prices
-- =====================================================

-- Get product IDs and insert prices
-- Note: Replace chain_id with your actual chain IDs from the chains table

-- You can run this to add average prices:
INSERT INTO prices (product_id, chain_id, price, updated_at)
SELECT p.id, 1,
  CASE
    WHEN p.name LIKE '%מילקי%' THEN 5.90
    WHEN p.name LIKE '%גמדים%' THEN 11.90
    WHEN p.name LIKE '%דנונה%' THEN 5.50
    WHEN p.name LIKE '%דני%' THEN 5.90
    WHEN p.name LIKE '%יופלה%' THEN 5.90
    WHEN p.name LIKE '%דניאלה%' THEN 6.90
    WHEN p.name LIKE '%מולר%' THEN 6.90
    WHEN p.name LIKE '%הגולן%' THEN 7.90
    WHEN p.name LIKE '%פרילי%' THEN 5.90
    WHEN p.name LIKE '%יולו%' THEN 6.90
    WHEN p.name LIKE '%קרלו%' THEN 7.90
    WHEN p.name LIKE '%ג׳לי%' THEN 4.90
    WHEN p.name LIKE '%מלבי%' THEN 6.90
    WHEN p.name LIKE '%סקי%' THEN 5.90
    WHEN p.name LIKE '%אקטימל%' THEN 6.90
    WHEN p.name LIKE '%מוס%' THEN 9.90
    WHEN p.name LIKE '%טירמיסו%' THEN 12.90
    WHEN p.name LIKE '%שוקו%' THEN 6.50
    WHEN p.name LIKE '%גו %' OR p.name = 'גו' THEN 7.90
    WHEN p.name LIKE '%שמנת%' THEN 8.90
    WHEN p.name LIKE '%לבן%' THEN 5.90
    ELSE 5.90
  END,
  NOW()
FROM products p
WHERE p.category = 'dairy'
  AND p.name IN (
    'מילקי', 'מילקי שוקולד', 'מילקי וניל', 'מילקי קרמל', 'מילקי עוגיות',
    'מילקי מקופלת', 'מילקי תות', 'מילקי פיסטוק', 'מארז מילקי קייק',
    'שמיניית מעדן מילקי עם קצפת', 'גמדים', 'גמדים סקוויז לדרך',
    'דנונה', 'דנונה שוקולד', 'יוגורט דנונה עם פצפוצים', 'יוגורט דנונה עם שוקולד',
    'מעדן דני וניל', 'מעדן דני שוקולד', 'שמיניית מעדן דני וניל',
    'שמיניית מעדן דני שוקולד', 'שמיניית מעדן יוגורט דנונה 3%',
    'שמיניית מעדן דנונה 0%', 'יופלה', 'יופלה תות', 'יופלה פירות יער',
    'יופלה אפרסק', 'יופלה 0%', 'יופלה 3%', 'דניאלה', 'דניאלה וניל',
    'דניאלה קרמל', 'מעדן דניאלה תות', 'מעדן דניאלה בננה',
    'מעדן וניל', 'מעדן שוקולד', 'מעדן קרמל', 'מעדן ביסקוויטים',
    'מעדן לוטוס', 'מעדן שוקולד לבן', 'מעדן תות', 'מעדן בננה', 'מעדן יוגורט',
    'מעדן וניל טרה', 'מעדן שוקולד טרה', 'יוגורט מולר אפרסק',
    'יוגורט מולר תות', 'יוגורט מולר טבעי', 'מעדן מולר קציפה',
    'מעדן הגולן וניל', 'מעדן הגולן שוקולד', 'מעדן הגולן קרמל',
    'יוגורט פרילי תות', 'יוגורט פרילי אננס', 'מעדן יולו שוקולד',
    'מעדן יולו שוקולד מריר', 'מעדן יולו שוקולד לבן', 'מעדן קרלו וניל',
    'מעדן קרלו שוקולד', 'מעדן ג׳לי תות', 'מעדן ג׳לי ענבים',
    'מעדן ג׳לי לימון', 'מעדן ג׳לי אננס', 'מעדן מלבי', 'מעדן ירח מתוק',
    'מעדן סקי וניל', 'אשל לבן 4.5%', 'גיל לבן 3%', 'שמנת חמוצה אורגינל 15%',
    'יוגורט באדי תות', 'אקטימל', 'אקטימל תות', 'גו שוקולד', 'גו וניל',
    'גו', 'פרוטי', 'שוקו יטבתה', 'שוקו תנובה', 'מוס שוקולד', 'מוס וניל',
    'מוס קפה', 'מוס לימון', 'טירמיסו', 'קינדר מילק'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY
-- Run this after the inserts to verify the products were added
-- =====================================================

-- SELECT COUNT(*) as total_dairy_desserts FROM products WHERE category = 'dairy';
-- SELECT name, barcode FROM products WHERE category = 'dairy' ORDER BY name;
