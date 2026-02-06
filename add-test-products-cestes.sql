-- Test Products for VB Spine (CESTES)
-- Run this SQL in your Supabase SQL Editor after creating the tables

-- Make sure the price column exists (if you haven't updated the schema yet)
-- ALTER TABLE cestes_products ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Insert test products with prices
INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine T-Shirt', 'Comfortable cotton t-shirt with VB Spine branding', 'product', true, true, ARRAY['Black', 'White', 'Navy'], ARRAY['S', 'M', 'L', 'XL'], 'CES-TEE-001', 25.00);

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Hoodie', 'Warm hoodie perfect for cooler weather', 'product', true, true, ARRAY['Black', 'Gray', 'Navy'], ARRAY['S', 'M', 'L', 'XL'], 'CES-HOOD-001', 45.00);

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Water Bottle', 'Stainless steel water bottle with VB Spine logo', 'product', true, false, ARRAY['Black', 'Purple', 'Silver'], ARRAY[]::TEXT[], 'CES-BOTTLE-001', 30.00);

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Notebook', 'Premium notebook for notes and ideas', 'product', true, false, ARRAY['Black', 'Purple'], ARRAY[]::TEXT[], 'CES-NOTE-001', 15.00);

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Backpack', 'Durable backpack with multiple compartments', 'product', true, false, ARRAY['Black', 'Navy'], ARRAY[]::TEXT[], 'CES-BAG-001', 55.00);

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Cap', 'Adjustable cap with embroidered logo', 'product', true, true, ARRAY['Black', 'Navy', 'Gray'], ARRAY['One Size'], 'CES-CAP-001', 20.00);

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Mug', 'Ceramic coffee mug perfect for your desk', 'product', true, false, ARRAY['White', 'Black'], ARRAY[]::TEXT[], 'CES-MUG-001', 12.00);

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Pen Set', 'Set of 3 premium pens with VB Spine branding', 'product', false, false, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'CES-PEN-001', 18.00);

-- Verify products were inserted
SELECT id, name, price, customer_item_number FROM cestes_products ORDER BY name;
