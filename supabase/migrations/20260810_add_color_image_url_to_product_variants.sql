-- Migration: Add color_image_url column to product_variants table for per-color variant photos
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color_image_url TEXT DEFAULT NULL;
