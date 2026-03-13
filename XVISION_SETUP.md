# XVision Quick Store Setup

## Overview

Simplified ecommerce for XVision with sequential product selection:
- **Landing**: Email whitelist
- **Bags**: Select 1 backpack
- **Water Bottles**: Select 1 water bottle
- **Wearables**: Select up to 2 (scrub set = 1)
- **Misc**: Journal and name badge (optional)
- **Shipping**: User enters full address
- **Review & Confirmation**

## Database Setup

1. Run `supabase-schema-xvision.sql` in Supabase SQL Editor to create:
   - `xvision_products`
   - `xvision_orders`
   - `xvision_order_items`

2. (Optional) Run `supabase-seed-xvision-products.sql` to insert the 23 products, or add via Supabase dashboard.

## Email Whitelist

Edit `lib/whitelist.ts` to add/remove allowed emails. Initial list includes 13 vbspineco.com addresses.

## Order Flow

1. `/` – Enter whitelisted email
2. `/bags` – Select 1 backpack
3. `/water-bottles` – Select 1 water bottle
4. `/wearables` – Select up to 2 wearables (scrub set counts as 1)
5. `/misc` – Journal (yes/no), Name badge (yes/no + display text)
6. `/shipping` – Full shipping address
7. `/review` – Review and submit
8. `/confirmation` – Order number (XVS-001, XVS-002, …)

## Admin

- Visit `/admin` and enter password (`NEXT_PUBLIC_ADMIN_PASSWORD`)
- View orders, export to Excel (Detailed Orders + Distribution Summary)
- Floating export button appears when logged in as admin

## Image Naming

- Format: `{SKU}_{color}.jpg` (e.g. `VBS-BG-RANGE_Black.jpg`)
- Place in `public/images/`
- See product catalog in plan for SKUs

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_PASSWORD` (optional)
