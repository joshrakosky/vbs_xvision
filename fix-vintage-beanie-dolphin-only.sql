-- Fix: Vintage Knit Beanie - remove Black, keep only Dolphin as default
-- Run in Supabase SQL Editor

UPDATE cestes_products 
SET available_colors = ARRAY['Dolphin'] 
WHERE customer_item_number = 'CES-BEANIE-VINTAGE';
