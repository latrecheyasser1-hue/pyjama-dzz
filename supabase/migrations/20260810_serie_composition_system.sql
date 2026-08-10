-- Migration: Add Serie Composition & Wholesale Series Qty to product_variants

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS serie_composition JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS wholesale_series_qty INT DEFAULT 0;

-- Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
