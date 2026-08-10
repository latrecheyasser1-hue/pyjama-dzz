-- Migration: Add bulk_price column to products table for retail volume pricing (5+ units)
ALTER TABLE products ADD COLUMN IF NOT EXISTS bulk_price NUMERIC DEFAULT NULL;

-- Synchronize existing values from bulk_discount_price_5 if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'bulk_discount_price_5'
  ) THEN
    UPDATE products 
    SET bulk_price = bulk_discount_price_5 
    WHERE bulk_price IS NULL AND bulk_discount_price_5 IS NOT NULL;
  END IF;
END $$;
