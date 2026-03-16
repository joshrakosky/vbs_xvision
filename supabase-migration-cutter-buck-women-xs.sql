-- Add XS to Women's Cutter and Buck Half-Zip sizes
-- Run this if you already have products seeded

UPDATE xvision_products
SET available_sizes = ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE customer_item_number = 'VBS-CB-HZIP-WOMEN';
