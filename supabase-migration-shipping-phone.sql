-- Add shipping_phone column for customer phone number
-- Run in Supabase SQL Editor

ALTER TABLE cestes_orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
