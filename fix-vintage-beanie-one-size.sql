-- Vintage Knit Beanie: One Size Fits All only, default to that size
-- Run in Supabase SQL Editor

UPDATE cestes_products 
SET 
  requires_size = true,
  available_sizes = ARRAY['OSFA']
WHERE customer_item_number = 'CES-BEANIE-VINTAGE';
