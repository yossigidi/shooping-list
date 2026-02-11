-- ListNest Database Update - February 2026
-- Updates: Eggs (new sizes + supervised prices), Fanta (orange + tropical flavors)

-- =====================================================
-- 1. EGGS - Add new products (30-unit trays + M size)
-- =====================================================

-- Add new egg products
INSERT INTO products (name, name_normalized, category, subcategory, unit_type, unit_quantity)
VALUES
    ('ביצים L 30 יח׳', 'ביצים l 30', 'dairy', 'eggs', 'unit', 30),
    ('ביצים XL 30 יח׳', 'ביצים xl 30', 'dairy', 'eggs', 'unit', 30),
    ('ביצים M 30 יח׳', 'ביצים m 30', 'dairy', 'eggs', 'unit', 30),
    ('ביצים M 12 יח׳', 'ביצים m 12', 'dairy', 'eggs', 'unit', 12)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. EGGS - Update prices (supervised prices from Shufersal)
-- =====================================================

-- Update existing egg prices to supervised prices
-- 12-unit trays
UPDATE prices p
SET price = 13.97, last_updated = NOW()
FROM products pr
WHERE p.product_id = pr.id
AND (pr.name LIKE '%ביצים L 12%' OR pr.name LIKE '%ביצים L%' AND pr.unit_quantity = 12);

UPDATE prices p
SET price = 15.19, last_updated = NOW()
FROM products pr
WHERE p.product_id = pr.id
AND (pr.name LIKE '%ביצים XL 12%' OR pr.name LIKE '%ביצים XL%' AND pr.unit_quantity = 12);

UPDATE prices p
SET price = 12.89, last_updated = NOW()
FROM products pr
WHERE p.product_id = pr.id
AND pr.name LIKE '%ביצים M 12%';

-- Insert prices for new 30-unit egg products (all chains)
INSERT INTO prices (product_id, chain_id, price, last_updated)
SELECT pr.id, c.id,
    CASE
        WHEN pr.name LIKE '%L 30%' THEN 34.92
        WHEN pr.name LIKE '%XL 30%' THEN 37.97
        WHEN pr.name LIKE '%M 30%' THEN 32.22
    END,
    NOW()
FROM products pr
CROSS JOIN chains c
WHERE pr.name LIKE '%ביצים%30%'
AND c.is_active = true
ON CONFLICT (product_id, chain_id) DO UPDATE SET price = EXCLUDED.price, last_updated = NOW();

-- Insert prices for M 12 eggs
INSERT INTO prices (product_id, chain_id, price, last_updated)
SELECT pr.id, c.id, 12.89, NOW()
FROM products pr
CROSS JOIN chains c
WHERE pr.name = 'ביצים M 12 יח׳'
AND c.is_active = true
ON CONFLICT (product_id, chain_id) DO UPDATE SET price = EXCLUDED.price, last_updated = NOW();

-- =====================================================
-- 3. FANTA - Add new products (Orange + Tropical)
-- =====================================================

-- Add new Fanta products
INSERT INTO products (name, name_normalized, category, subcategory, unit_type, unit_quantity)
VALUES
    ('פאנטה תפוזים 1.5 ליטר', 'פאנטה תפוזים 1.5 ליטר', 'beverages', 'soft_drinks', 'liter', 1.5),
    ('פאנטה טרופי 1.5 ליטר', 'פאנטה טרופי 1.5 ליטר', 'beverages', 'soft_drinks', 'liter', 1.5),
    ('פאנטה תפוזים פחית 330 מ"ל', 'פאנטה תפוזים פחית 330', 'beverages', 'soft_drinks', 'ml', 330),
    ('פאנטה טרופי פחית 330 מ"ל', 'פאנטה טרופי פחית 330', 'beverages', 'soft_drinks', 'ml', 330)
ON CONFLICT (name) DO NOTHING;

-- Insert prices for new Fanta products
INSERT INTO prices (product_id, chain_id, price, last_updated)
SELECT pr.id, c.id,
    CASE
        WHEN pr.name LIKE '%1.5 ליטר%' THEN 8.50
        WHEN pr.name LIKE '%פחית%' THEN 5.90
    END,
    NOW()
FROM products pr
CROSS JOIN chains c
WHERE (pr.name LIKE 'פאנטה תפוזים%' OR pr.name LIKE 'פאנטה טרופי%')
AND c.is_active = true
ON CONFLICT (product_id, chain_id) DO UPDATE SET price = EXCLUDED.price, last_updated = NOW();

-- =====================================================
-- 4. FANTA - Remove old 2L product (optional - mark inactive)
-- =====================================================

-- Option A: Delete the old product completely
-- DELETE FROM products WHERE name = 'פאנטה 2 ליטר';

-- Option B: Keep for history but remove prices (recommended)
DELETE FROM prices
WHERE product_id IN (SELECT id FROM products WHERE name = 'פאנטה 2 ליטר');

-- =====================================================
-- 5. Verify changes
-- =====================================================

-- Check eggs
SELECT pr.name, p.price, c.name_he as chain
FROM products pr
JOIN prices p ON pr.id = p.product_id
JOIN chains c ON p.chain_id = c.id
WHERE pr.name LIKE '%ביצים%'
ORDER BY pr.name, c.name_he
LIMIT 50;

-- Check Fanta
SELECT pr.name, p.price, c.name_he as chain
FROM products pr
JOIN prices p ON pr.id = p.product_id
JOIN chains c ON p.chain_id = c.id
WHERE pr.name LIKE '%פאנטה%'
ORDER BY pr.name, c.name_he
LIMIT 30;

-- Summary
SELECT 'Products updated successfully!' as status,
    (SELECT COUNT(*) FROM products WHERE name LIKE '%ביצים%30%') as eggs_30_count,
    (SELECT COUNT(*) FROM products WHERE name LIKE 'פאנטה תפוזים%' OR name LIKE 'פאנטה טרופי%') as fanta_new_count;
