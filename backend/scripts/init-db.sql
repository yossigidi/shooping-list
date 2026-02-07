-- ListNest Price Comparison Database Schema
-- This file is automatically run on first database initialization

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text similarity search
CREATE EXTENSION IF NOT EXISTS btree_gin; -- For GIN indexes

-- Chains table
CREATE TABLE IF NOT EXISTS chains (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_he VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER REFERENCES chains(id) ON DELETE CASCADE,
    store_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100),
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(chain_id, store_id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    name_normalized VARCHAR(255),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    manufacturer VARCHAR(100),
    unit_type VARCHAR(20),
    unit_quantity DECIMAL(10, 3),
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prices table (current prices)
CREATE TABLE IF NOT EXISTS prices (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    chain_id INTEGER REFERENCES chains(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2),
    is_on_sale BOOLEAN DEFAULT false,
    sale_price DECIMAL(10, 2),
    promotion_description VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, chain_id)
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    chain_id INTEGER REFERENCES chains(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    was_on_sale BOOLEAN DEFAULT false,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_name_normalized ON products(name_normalized);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_normalized_trgm ON products USING gin (name_normalized gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_prices_product ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_chain ON prices(chain_id);
CREATE INDEX IF NOT EXISTS idx_prices_updated ON prices(last_updated);
CREATE INDEX IF NOT EXISTS idx_prices_price ON prices(price);

CREATE INDEX IF NOT EXISTS idx_history_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_history_chain ON price_history(chain_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON price_history(recorded_at);

CREATE INDEX IF NOT EXISTS idx_stores_chain ON stores(chain_id);

-- Insert initial chain data
INSERT INTO chains (code, name, name_he, is_active) VALUES
    ('shufersal', 'Shufersal', 'שופרסל', true),
    ('rami_levy', 'Rami Levy', 'רמי לוי', true),
    ('victory', 'Victory', 'ויקטורי', true),
    ('yeinot_bitan', 'Yeinot Bitan', 'יינות ביתן', true),
    ('mega', 'Mega', 'מגה', true),
    ('hatzi_hinam', 'Hatzi Hinam', 'חצי חינם', true),
    ('tiv_taam', 'Tiv Taam', 'טיב טעם', true),
    ('osher_ad', 'Osher Ad', 'אושר עד', true),
    ('yohananof', 'Yohananof', 'יוחננוף', true),
    ('super_pharm', 'Super Pharm', 'סופר פארם', true),
    ('freshmarket', 'Fresh Market', 'פרש מרקט', true),
    ('stop_market', 'Stop Market', 'סטופ מרקט', true),
    ('king_store', 'King Store', 'קינג סטור', true),
    ('shuk_hair', 'Shuk HaIr', 'שוק העיר', true),
    ('carrefour', 'Carrefour', 'קרפור', true),
    ('be', 'Be', 'Be', true),
    ('zol_vbigadol', 'Zol VBigadol', 'זול ובגדול', true),
    ('maayan_2000', 'Maayan 2000', 'מעיין 2000', true),
    ('super_yuda', 'Super Yuda', 'סופר יודה', true),
    ('politzer', 'Politzer', 'פוליצר', true)
ON CONFLICT (code) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO listnest;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO listnest;
