-- 1. إنشاء جدول المنتجات الأساسي (Products Table)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    supplier_name TEXT,
    supplier_phone TEXT,
    cost_price NUMERIC NOT NULL DEFAULT 0,
    selling_price NUMERIC NOT NULL DEFAULT 0,
    old_price NUMERIC,
    wholesale_price NUMERIC,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. إنشاء جدول ألوان المنتجات مع الصور المخصصة لكل لون (Product Colors)
CREATE TABLE IF NOT EXISTS public.product_colors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. إنشاء جدول مقاسات المنتجات (Product Sizes)
CREATE TABLE IF NOT EXISTS public.product_sizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. إنشاء جدول متغيرات المخزون للمستودعات الثلاثة (Product Variants)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    size_name TEXT NOT NULL,
    delivery_stock INTEGER DEFAULT 10,
    store_stock INTEGER DEFAULT 10,
    wholesale_stock INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. تفعيل الصلاحيات الشاملة (RLS Policies)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to products" ON public.products;
CREATE POLICY "Allow full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to product_colors" ON public.product_colors;
CREATE POLICY "Allow full access to product_colors" ON public.product_colors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to product_sizes" ON public.product_sizes;
CREATE POLICY "Allow full access to product_sizes" ON public.product_sizes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to product_variants" ON public.product_variants;
CREATE POLICY "Allow full access to product_variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);

-- 6. تحديث الـ Schema Cache
NOTIFY pgrst, 'reload schema';
