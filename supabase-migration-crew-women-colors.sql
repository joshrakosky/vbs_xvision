-- Remove Puma Black Heather from Women's Puma Cloudspun - only Light Grey Heather available
-- Run this if you already have products seeded with the old colors

UPDATE xvision_products
SET available_colors = ARRAY['Light Grey Heather']
WHERE customer_item_number = 'VBS-CREW-WOMEN';
