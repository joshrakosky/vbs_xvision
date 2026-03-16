-- Update TravisMathew polo colors: Black Heather -> Quiet Shade Grey Heather
-- Run this if you already have products seeded with the old color name

UPDATE xvision_products
SET available_colors = ARRAY['Quiet Shade Grey Heather', 'Purple Sage Heather']
WHERE customer_item_number IN ('VBS-POLO-MEN', 'VBS-POLO-WOMEN');
