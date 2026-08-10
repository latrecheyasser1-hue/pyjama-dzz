-- Comprehensive migration to guarantee all variant columns exist
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS size TEXT;

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS size_name TEXT;

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS color_name TEXT;

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS color_image_url TEXT;

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS delivery_stock INT DEFAULT 0;

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS store_stock INT DEFAULT 0;

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS wholesale_stock INT DEFAULT 0;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
