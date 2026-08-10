-- إنشاء جدول الموردين والورشات (Suppliers Table)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- تفعيل الصلاحيات (RLS Policies)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to suppliers" ON public.suppliers;

CREATE POLICY "Allow full access to suppliers" 
ON public.suppliers 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- تحديث الـ Schema Cache
NOTIFY pgrst, 'reload schema';
