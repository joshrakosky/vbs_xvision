-- Populate vendor_item_num for stock restrictions lookup
-- Run in Supabase SQL Editor (required for stock restrictions to work)
-- Mapping: customer_item_number -> vendor_item_num (from product DB)

UPDATE cestes_products SET vendor_item_num = 'KSV-1' WHERE customer_item_number = 'CES-VEST-MEN';
UPDATE cestes_products SET vendor_item_num = 'KSV-1W' WHERE customer_item_number = 'CES-VEST-WOMEN';
UPDATE cestes_products SET vendor_item_num = 'WK-1' WHERE customer_item_number = 'CES-CREW-MEN';
UPDATE cestes_products SET vendor_item_num = 'WK-1W' WHERE customer_item_number = 'CES-CREW-WOMEN';
UPDATE cestes_products SET vendor_item_num = 'SX-5' WHERE customer_item_number = 'CES-FLEECE-MEN';
UPDATE cestes_products SET vendor_item_num = 'SX-5W' WHERE customer_item_number = 'CES-FLEECE-WOMEN';
UPDATE cestes_products SET vendor_item_num = 'FPL-3M' WHERE customer_item_number IN ('CES-HOODY-MEN', 'CES-QZIP-MEN');
UPDATE cestes_products SET vendor_item_num = 'FPL-3W' WHERE customer_item_number = 'CES-QZIP-WOMEN';
UPDATE cestes_products SET vendor_item_num = 'TG-1' WHERE customer_item_number = 'CES-TEE-MEN';
UPDATE cestes_products SET vendor_item_num = 'TG-1W' WHERE customer_item_number = 'CES-TEE-WOMEN';
UPDATE cestes_products SET vendor_item_num = 'BTV-1' WHERE customer_item_number = 'CES-BEANIE-NOVARRA';
UPDATE cestes_products SET vendor_item_num = 'BTC-1' WHERE customer_item_number = 'CES-BEANIE-VINTAGE';
UPDATE cestes_products SET vendor_item_num = 'GLX-1' WHERE customer_item_number = 'CES-GLOVES';
UPDATE cestes_products SET vendor_item_num = 'SCX-1' WHERE customer_item_number = 'CES-SCARF';
