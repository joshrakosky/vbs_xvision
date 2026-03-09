-- Update unit_cost, unit_sell, and price for products
-- Run in Supabase SQL Editor
-- Frontend uses 'price' for display and budget - must update it to reflect unit_sell

-- CES-VEST-MEN
UPDATE cestes_products SET unit_cost = 28.75, unit_sell = 57.55, price = 57.55 WHERE customer_item_number = 'CES-VEST-MEN';

-- CES-VEST-WOMEN
UPDATE cestes_products SET unit_cost = 28.75, unit_sell = 57.55, price = 57.55 WHERE customer_item_number = 'CES-VEST-WOMEN';

-- CES-CREW-MEN (Ashburn Crew)
UPDATE cestes_products SET unit_cost = 20, unit_sell = 51, price = 51 WHERE customer_item_number = 'CES-CREW-MEN';

-- CES-CREW-WOMEN (Ashburn Crew)
UPDATE cestes_products SET unit_cost = 20, unit_sell = 51, price = 51 WHERE customer_item_number = 'CES-CREW-WOMEN';

-- CES-FLEECE-MEN
UPDATE cestes_products SET unit_cost = 35.81, unit_sell = 71.65, price = 71.65 WHERE customer_item_number = 'CES-FLEECE-MEN';

-- CES-FLEECE-WOMEN
UPDATE cestes_products SET unit_cost = 35.81, unit_sell = 71.65, price = 71.65 WHERE customer_item_number = 'CES-FLEECE-WOMEN';

-- CES-HOODY-MEN
UPDATE cestes_products SET unit_cost = 38.16, unit_sell = 76.35, price = 76.35 WHERE customer_item_number = 'CES-HOODY-MEN';

-- CES-HOODY-WOMEN
UPDATE cestes_products SET unit_cost = 38.16, unit_sell = 76.35, price = 76.35 WHERE customer_item_number = 'CES-HOODY-WOMEN';

-- CES-QZIP-MEN
UPDATE cestes_products SET unit_cost = 28.78, unit_sell = 57.6, price = 57.6 WHERE customer_item_number = 'CES-QZIP-MEN';

-- CES-QZIP-WOMEN
UPDATE cestes_products SET unit_cost = 28.78, unit_sell = 57.6, price = 57.6 WHERE customer_item_number = 'CES-QZIP-WOMEN';

-- CES-TEE-MEN
UPDATE cestes_products SET unit_cost = 12.37, unit_sell = 24.75, price = 24.75 WHERE customer_item_number = 'CES-TEE-MEN';

-- CES-TEE-WOMEN
UPDATE cestes_products SET unit_cost = 12.37, unit_sell = 24.75, price = 24.75 WHERE customer_item_number = 'CES-TEE-WOMEN';

-- CES-BEANIE-VINTAGE
UPDATE cestes_products SET unit_cost = 12.37, unit_sell = 25.5, price = 25.5 WHERE customer_item_number = 'CES-BEANIE-VINTAGE';

-- CES-BEANIE-NOVARRA
UPDATE cestes_products SET unit_cost = 8.62, unit_sell = 17.75, price = 17.75 WHERE customer_item_number = 'CES-BEANIE-NOVARRA';

-- CES-GLOVES
UPDATE cestes_products SET unit_cost = 10.43, unit_sell = 22.75, price = 22.75 WHERE customer_item_number = 'CES-GLOVES';

-- CES-SCARF
UPDATE cestes_products SET unit_cost = 11.43, unit_sell = 25.65, price = 25.65 WHERE customer_item_number = 'CES-SCARF';
