-- XVision Product Seed
-- Run after supabase-schema-xvision.sql
-- Inserts all 23 products from the catalog

INSERT INTO xvision_products (name, category, customer_item_number, vendor_ref, vendor_item_num, requires_color, requires_size, available_colors, available_sizes) VALUES
-- Bags
('OGIO Range Pack', 'bags', 'VBS-BG-RANGE', 'Sanmar', '91007', true, false, ARRAY['Black', 'Tarmac'], ARRAY['OSFA']),
('TravisMathew Recess Backpack', 'bags', 'VBS-BG-TM', 'Sanmar', 'TMB109', true, false, ARRAY['Black'], ARRAY['OSFA']),
('OGIO Sly Messenger Bag', 'bags', 'VBS-BG-SLY', 'Sanmar', '417041', true, false, ARRAY['Heather Grey'], ARRAY['OSFA']),
-- Water Bottles
('Polar Camel 40oz Water Bottle', 'water_bottle', 'VBS-POLAR-40OZ', 'Diamondback', 'PLCM-DB40', true, false, ARRAY['Purple'], ARRAY['40oz']),
('YETI Rambler 20 Oz. Tumbler', 'water_bottle', 'VBS-YETI-20OZ', 'Diamondback', 'YETIDT20', true, false, ARRAY['Black', 'White'], ARRAY['20oz']),
-- Wearables - Full Zip
('Men''s OGIO Transcend Full-Zip', 'full_zip_mens', 'VBS-OGIO-FZIP-MEN', 'Sanmar', 'OG860', true, true, ARRAY['Blacktop'], ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']),
('Women''s OGIO Transcend Full-Zip', 'full_zip_womens', 'VBS-OGIO-FZIP-WOMEN', 'Sanmar', 'LOG860', true, true, ARRAY['Blacktop'], ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']),
-- Vests
('Men''s Carhartt Gillam Vest', 'vest_mens', 'VBS-VEST-MEN', 'Sanmar', 'CT102286', true, true, ARRAY['Black'], ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']),
('Women''s Carhartt Gillam Vest', 'vest_womens', 'VBS-VEST-WOMEN', 'Sanmar', 'CT104315', true, true, ARRAY['Black'], ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL']),
-- Polos
('Women''s TravisMathew Oceanside Heather Polo', 'polo_womens', 'VBS-POLO-WOMEN', 'Sanmar', 'TM1WW002', true, true, ARRAY['Black Heather', 'Purple Sage Heather'], ARRAY['S', 'M', 'L', 'XL', '2XL']),
('Men''s TravisMathew Oceanside Heather Polo', 'polo_mens', 'VBS-POLO-MEN', 'Sanmar', 'TM1MU412', true, true, ARRAY['Black Heather', 'Purple Sage Heather'], ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']),
-- Sweatshirts
('Women''s Puma Golf Cloudspun Crew Neck Sweatshirt', 'sweatshirt_womens', 'VBS-CREW-WOMEN', 'S&S', '599267', true, true, ARRAY['Light Grey Heather', 'Puma Black Heather'], ARRAY['S', 'M', 'L', 'XL', '2XL']),
('Men''s Puma Golf Cloudspun Crew Neck Sweatshirt', 'sweatshirt_mens', 'VBS-CREW-MEN', 'S&S', '531279', true, true, ARRAY['High Rise', 'Puma Black Heather'], ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']),
-- Half/Quarter Zip
('Cutter and Buck Adapt Eco Knit Women''s Half-Zip Pullover', 'half_zip_womens', 'VBS-CB-HZIP-WOMEN', 'Cutter & Buck', 'LCK00128', true, true, ARRAY['Black/College Purple', 'College Purple', 'Polished'], ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']),
('Cutter and Buck Adapt Eco Knit Men''s Quarter-Zip', 'half_zip_mens', 'VBS-CB-QZIP-MEN', 'Cutter & Buck', 'MCK01143', true, true, ARRAY['Black/College Purple', 'College Purple', 'Polished'], ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']),
-- Scrub Bottoms
('FIGS Women''s Kade Cargo Scrub Pants', 'scrub_bottom', 'VBS-SCRB-KADE', 'FIGS', 'KADE', true, true, ARRAY['Black'], ARRAY['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']),
('FIGS Women''s Zamora Jogger Scrub Pants', 'scrub_bottom', 'VBS-SCRB-ZAMORA', 'FIGS', 'ZAMORA', true, true, ARRAY['Black'], ARRAY['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']),
('FIGS Men''s Axim Cargo Scrub Pants', 'scrub_bottom', 'VBS-SCRB-AXIM', 'FIGS', 'AXIM', true, true, ARRAY['Black'], ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']),
('FIGS Men''s Tansen Jogger Scrub Pants', 'scrub_bottom', 'VBS-SCRB-TANSEN', 'FIGS', 'TANSEN', true, true, ARRAY['Black'], ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']),
-- Scrub Tops
('FIGS Women''s Catarina Scrub Top', 'scrub_top', 'VBS-SCRB-CATARINA', 'FIGS', 'CATARINA', true, true, ARRAY['Black'], ARRAY['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']),
('FIGS Men''s Leon Scrub Top', 'scrub_top', 'VBS-SCRB-LEON', 'FIGS', 'LEON', true, true, ARRAY['Black'], ARRAY['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']),
-- Misc
('Libretto Journal', 'journal', 'VBS-JOURNAL', 'RUPT', '96025', false, false, ARRAY['Grey'], ARRAY[]::TEXT[]),
('Name Badge', 'name_badge', 'VBS-BD', 'Graphic Electronics', 'NameBadge', false, false, ARRAY[]::TEXT[], ARRAY[]::TEXT[]);
