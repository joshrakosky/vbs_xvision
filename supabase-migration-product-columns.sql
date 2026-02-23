-- Migration: Add product columns for streamlined export and order fulfillment
-- Run in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)

-- vendor_ref: Vendor reference (e.g. "Hit")
ALTER TABLE cestes_products ADD COLUMN IF NOT EXISTS vendor_ref TEXT;

-- vendor_item_num: Vendor's catalog item number (e.g. KSV-1, WK-1W)
ALTER TABLE cestes_products ADD COLUMN IF NOT EXISTS vendor_item_num TEXT;

-- unit_cost: Cost per unit from vendor
ALTER TABLE cestes_products ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10, 2);

-- unit_sell: Selling price per unit (price column remains for backward compatibility)
ALTER TABLE cestes_products ADD COLUMN IF NOT EXISTS unit_sell DECIMAL(10, 2);

-- logo: Logo style - Stacked, Horiz, etc.
ALTER TABLE cestes_products ADD COLUMN IF NOT EXISTS logo TEXT;

-- logo_colors_available: Available logo colors (e.g. "Purple, White")
ALTER TABLE cestes_products ADD COLUMN IF NOT EXISTS logo_colors_available TEXT;

-- logo_location: Logo placement on product (e.g. "Left Chest", "Front Cuff")
ALTER TABLE cestes_products ADD COLUMN IF NOT EXISTS logo_location TEXT;

-- notes: Inventory/fulfillment notes (e.g. "No stock in Graphite Heather 4XL")
ALTER TABLE cestes_products ADD COLUMN IF NOT EXISTS notes TEXT;

-- logo_color on order items: Selected logo color for fulfillment
ALTER TABLE cestes_order_items ADD COLUMN IF NOT EXISTS logo_color TEXT;
