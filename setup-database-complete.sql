-- Complete Database Setup for VB Spine (CESTES)
-- Run this entire file in your Supabase SQL Editor
-- This will create all tables and add test products

-- ============================================
-- STEP 1: Create Tables
-- ============================================

-- Products table for cestes
CREATE TABLE IF NOT EXISTS cestes_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  thumbnail_url_black TEXT,
  thumbnail_url_white TEXT,
  color_thumbnails JSONB, -- Flexible color-to-thumbnail mapping
  specs TEXT,
  category TEXT NOT NULL DEFAULT 'product', -- Single category since only one product selection
  requires_color BOOLEAN DEFAULT FALSE,
  requires_size BOOLEAN DEFAULT FALSE,
  available_colors TEXT[], -- Array of color options
  available_sizes TEXT[], -- Array of size options
  customer_item_number TEXT, -- SKU for backend tracking
  deco TEXT, -- Decoration information
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Product price for budget control
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table for cestes
CREATE TABLE IF NOT EXISTS cestes_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_address2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'USA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email) -- Prevent duplicate orders by email (one order per email)
);

-- Order items table for cestes
CREATE TABLE IF NOT EXISTS cestes_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES cestes_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES cestes_products(id),
  product_name TEXT NOT NULL, -- Denormalized for easier export
  customer_item_number TEXT, -- SKU for backend tracking
  color TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cestes_orders_email ON cestes_orders(email);
CREATE INDEX IF NOT EXISTS idx_cestes_orders_order_number ON cestes_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_cestes_order_items_order_id ON cestes_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cestes_products_category ON cestes_products(category);

-- Enable Row Level Security (RLS)
ALTER TABLE cestes_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cestes_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cestes_order_items ENABLE ROW LEVEL SECURITY;

-- Policies for products (public read access)
DROP POLICY IF EXISTS "cestes_products are viewable by everyone" ON cestes_products;
CREATE POLICY "cestes_products are viewable by everyone"
  ON cestes_products FOR SELECT
  USING (true);

-- Policies for orders
DROP POLICY IF EXISTS "cestes_orders are insertable" ON cestes_orders;
CREATE POLICY "cestes_orders are insertable"
  ON cestes_orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "cestes_orders are viewable by everyone" ON cestes_orders;
CREATE POLICY "cestes_orders are viewable by everyone" -- Admin will use service key
  ON cestes_orders FOR SELECT
  USING (true);

-- Policies for order_items
DROP POLICY IF EXISTS "cestes_order_items are insertable" ON cestes_order_items;
CREATE POLICY "cestes_order_items are insertable"
  ON cestes_order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "cestes_order_items are viewable by everyone" ON cestes_order_items;
CREATE POLICY "cestes_order_items are viewable by everyone"
  ON cestes_order_items FOR SELECT
  USING (true);

-- ============================================
-- STEP 2: Add Test Products
-- ============================================

-- Clear any existing test products (optional - comment out if you want to keep existing products)
-- DELETE FROM cestes_products WHERE customer_item_number LIKE 'CES-%';

-- Insert test products with prices (totaling various amounts to test budget tracker)
INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine T-Shirt', 'Comfortable cotton t-shirt with VB Spine branding', 'product', true, true, ARRAY['Black', 'White', 'Navy'], ARRAY['S', 'M', 'L', 'XL'], 'CES-TEE-001', 25.00)
ON CONFLICT DO NOTHING;

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Hoodie', 'Warm hoodie perfect for cooler weather', 'product', true, true, ARRAY['Black', 'Gray', 'Navy'], ARRAY['S', 'M', 'L', 'XL'], 'CES-HOOD-001', 45.00)
ON CONFLICT DO NOTHING;

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Water Bottle', 'Stainless steel water bottle with VB Spine logo', 'product', true, false, ARRAY['Black', 'Purple', 'Silver'], ARRAY[]::TEXT[], 'CES-BOTTLE-001', 30.00)
ON CONFLICT DO NOTHING;

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Notebook', 'Premium notebook for notes and ideas', 'product', true, false, ARRAY['Black', 'Purple'], ARRAY[]::TEXT[], 'CES-NOTE-001', 15.00)
ON CONFLICT DO NOTHING;

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Backpack', 'Durable backpack with multiple compartments', 'product', true, false, ARRAY['Black', 'Navy'], ARRAY[]::TEXT[], 'CES-BAG-001', 55.00)
ON CONFLICT DO NOTHING;

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Cap', 'Adjustable cap with embroidered logo', 'product', true, true, ARRAY['Black', 'Navy', 'Gray'], ARRAY['One Size'], 'CES-CAP-001', 20.00)
ON CONFLICT DO NOTHING;

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Mug', 'Ceramic coffee mug perfect for your desk', 'product', true, false, ARRAY['White', 'Black'], ARRAY[]::TEXT[], 'CES-MUG-001', 12.00)
ON CONFLICT DO NOTHING;

INSERT INTO cestes_products (name, description, category, requires_color, requires_size, available_colors, available_sizes, customer_item_number, price) 
VALUES 
('VB Spine Pen Set', 'Set of 3 premium pens with VB Spine branding', 'product', false, false, ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'CES-PEN-001', 18.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 3: Verify Setup
-- ============================================

-- Check if tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('cestes_products', 'cestes_orders', 'cestes_order_items')
ORDER BY table_name;

-- Verify products were inserted
SELECT id, name, price, customer_item_number, requires_color, requires_size 
FROM cestes_products 
ORDER BY name;
