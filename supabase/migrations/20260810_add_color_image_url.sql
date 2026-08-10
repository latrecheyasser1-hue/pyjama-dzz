-- Add missing columns to product_variants if they do not exist
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS color_image_url TEXT;

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS size_name TEXT;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
