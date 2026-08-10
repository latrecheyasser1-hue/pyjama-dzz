-- Migration: Advanced Wholesale System & Multi-Warehouse Columns

-- 1. Add Wholesale & Super Gros pricing & thresholds to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC,
ADD COLUMN IF NOT EXISTS super_gros_price NUMERIC,
ADD COLUMN IF NOT EXISTS units_per_serie INT DEFAULT 4,
ADD COLUMN IF NOT EXISTS min_wholesale_series INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS super_gros_threshold INT DEFAULT 10,
ADD COLUMN IF NOT EXISTS is_sur_commande BOOLEAN DEFAULT false;

-- 2. Add independent multi-warehouse stocks to product_variants table
ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS delivery_stock INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS store_stock INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS wholesale_stock INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_sur_commande BOOLEAN DEFAULT false;

-- 3. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
