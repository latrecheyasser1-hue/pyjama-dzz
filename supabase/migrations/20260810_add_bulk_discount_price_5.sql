-- Add bulk_discount_price_5 column to products table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='products' AND column_name='bulk_discount_price_5'
    ) THEN
        ALTER TABLE public.products ADD COLUMN bulk_discount_price_5 NUMERIC NULL;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
