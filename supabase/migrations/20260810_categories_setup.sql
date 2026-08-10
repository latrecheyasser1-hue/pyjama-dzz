-- 1. إنشاء جدول الأقسام (Categories Table Setup for Pyjama DZ Admin ERP)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. تفعيل الصلاحيات (RLS Policies) باش السيستم يقدر يقرأ ويحفظ بلا مشاكل
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to categories" ON public.categories;
CREATE POLICY "Allow full access to categories" 
ON public.categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. تحديث الـ Schema Cache
NOTIFY pgrst, 'reload schema';
