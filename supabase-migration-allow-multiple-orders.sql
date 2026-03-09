-- Allow multiple orders per email (for testing)
-- Run this in Supabase SQL Editor to drop the one-order-per-email constraint
-- The API no longer checks for duplicates; this migration removes the DB constraint

ALTER TABLE cestes_orders DROP CONSTRAINT IF EXISTS cestes_orders_email_key;
