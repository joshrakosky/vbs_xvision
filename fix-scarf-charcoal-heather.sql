-- Fix: Scarf color is Charcoal Heather, not Charcoal
-- Run in Supabase SQL Editor

UPDATE cestes_products 
SET available_colors = ARRAY['Black', 'Charcoal Heather'] 
WHERE customer_item_number = 'CES-SCARF';
