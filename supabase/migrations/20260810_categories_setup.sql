-- Supabase SQL Table Setup for Categories Module in Pyjama DZ Admin ERP

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & set public read/write policy
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on categories" ON public.categories;
CREATE POLICY "Allow public select on categories" 
ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update/delete on categories" ON public.categories;
CREATE POLICY "Allow public insert/update/delete on categories" 
ON public.categories FOR ALL USING (true);
