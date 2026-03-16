-- Update Cutter & Buck product names: move Men's/Women's to front
-- Run this if you already have products seeded with the old names

UPDATE xvision_products
SET name = 'Women''s Cutter and Buck Adapt Eco Knit Half-Zip Pullover'
WHERE customer_item_number = 'VBS-CB-HZIP-WOMEN';

UPDATE xvision_products
SET name = 'Men''s Cutter and Buck Adapt Eco Knit Quarter-Zip'
WHERE customer_item_number = 'VBS-CB-QZIP-MEN';
