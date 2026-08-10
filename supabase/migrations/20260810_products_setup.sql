-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    supplier_name TEXT,
    supplier_phone TEXT,
    cost_price NUMERIC DEFAULT 0,
    selling_price NUMERIC DEFAULT 0,
    old_price NUMERIC,
    wholesale_price NUMERIC,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to products"
ON public.products FOR ALL USING (true) WITH CHECK (true);


-- 2. Create Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT,
    color_image_url TEXT,
    size_name TEXT,
    size TEXT,
    delivery_stock INT DEFAULT 0,
    store_stock INT DEFAULT 0,
    wholesale_stock INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to product_variants"
ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

-- 3. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
