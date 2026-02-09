-- Create promotions table for ListNest
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER REFERENCES chains(id),
    promo_id VARCHAR(100),
    description TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    discount_type VARCHAR(50),
    discount_rate DECIMAL(5,2),
    min_qty INTEGER,
    product_ids INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_promotions_chain_id ON promotions(chain_id);
CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON promotions(end_date);

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on promotions"
ON promotions FOR SELECT
USING (true);

-- Allow service role to insert/update/delete
CREATE POLICY "Allow service role full access on promotions"
ON promotions FOR ALL
USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON promotions TO anon;
GRANT SELECT ON promotions TO authenticated;
GRANT ALL ON promotions TO service_role;
GRANT USAGE, SELECT ON SEQUENCE promotions_id_seq TO service_role;
