# XVision Quick Store

A simplified ecommerce site for XVision product selection. Users enter a whitelisted email, select products in sequence (instructions → bags → water bottles → wearables 1 & 2 → misc), enter shipping address, and receive an order confirmation.

## Features

- **Email Whitelist**: Only whitelisted emails can access (see `lib/whitelist.ts`)
- **Sequential Selection**: Bags (1) → Water bottles (1) → Wearables (up to 2) → Journal & name badge
- **User Shipping**: Full address entered by user
- **Admin Dashboard**: View and export orders to Excel

## Quick Start

```bash
npm install
```

1. Run `supabase-schema-xvision.sql` in Supabase
2. Add products (or run `supabase-seed-xvision-products.sql`)
3. Set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ADMIN_PASSWORD`
4. `npm run dev`

## Order Number Format

XVS-001, XVS-002, etc.

## Documentation

- `XVISION_SETUP.md` – Detailed setup guide
