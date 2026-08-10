-- Ensure size and size_name columns both exist in product_variants table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='product_variants' AND column_name='size'
    ) THEN
        ALTER TABLE public.product_variants ADD COLUMN size TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='product_variants' AND column_name='size_name'
    ) THEN
        ALTER TABLE public.product_variants ADD COLUMN size_name TEXT;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
