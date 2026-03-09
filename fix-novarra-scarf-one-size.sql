-- Novarra Knit Beanie and Avalante Knit Scarf: OSFA (One Size Fits All) only, default to that size
-- Run in Supabase SQL Editor

UPDATE cestes_products 
SET 
  requires_size = true,
  available_sizes = ARRAY['OSFA']
WHERE customer_item_number IN ('CES-BEANIE-NOVARRA', 'CES-SCARF');
