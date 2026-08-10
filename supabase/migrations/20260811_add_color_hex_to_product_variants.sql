-- Migration: Add color_hex column to product_variants table for hex color codes
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color_hex TEXT DEFAULT '#ffffff';
