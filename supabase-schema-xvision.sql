-- XVision Quick Store Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Products table for XVision
CREATE TABLE IF NOT EXISTS xvision_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  thumbnail_url_black TEXT,
  thumbnail_url_white TEXT,
  color_thumbnails JSONB,
  specs TEXT,
  category TEXT NOT NULL DEFAULT 'product',
  requires_color BOOLEAN DEFAULT FALSE,
  requires_size BOOLEAN DEFAULT FALSE,
  available_colors TEXT[],
  available_sizes TEXT[],
  customer_item_number TEXT,
  deco TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  vendor_ref TEXT,
  vendor_item_num TEXT,
  unit_cost DECIMAL(10, 2),
  unit_sell DECIMAL(10, 2),
  logo TEXT,
  logo_colors_available TEXT,
  logo_location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table for XVision
CREATE TABLE IF NOT EXISTS xvision_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_address2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'USA',
  name_badge_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table for XVision
CREATE TABLE IF NOT EXISTS xvision_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES xvision_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES xvision_products(id),
  product_name TEXT NOT NULL,
  customer_item_number TEXT,
  color TEXT,
  size TEXT,
  logo_color TEXT,
  custom_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_xvision_orders_email ON xvision_orders(email);
CREATE INDEX IF NOT EXISTS idx_xvision_orders_order_number ON xvision_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_xvision_order_items_order_id ON xvision_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_xvision_products_category ON xvision_products(category);

-- Enable Row Level Security (RLS)
ALTER TABLE xvision_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE xvision_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE xvision_order_items ENABLE ROW LEVEL SECURITY;

-- Policies for products (public read access)
CREATE POLICY "xvision_products are viewable by everyone"
  ON xvision_products FOR SELECT
  USING (true);

-- Policies for orders
CREATE POLICY "xvision_orders are insertable"
  ON xvision_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "xvision_orders are viewable by everyone"
  ON xvision_orders FOR SELECT
  USING (true);

-- Policies for order_items
CREATE POLICY "xvision_order_items are insertable"
  ON xvision_order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "xvision_order_items are viewable by everyone"
  ON xvision_order_items FOR SELECT
  USING (true);
