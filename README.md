# VB Spine (CESTES) Ecommerce Site

A simplified ecommerce site for VB Spine product selection. Users enter a whitelisted email address to access the site, select a product, provide shipping information, and receive an order confirmation.

## Features

- **Email Whitelist Access**: Only whitelisted email addresses can access the site
- **Single Product Selection**: One product selection page with color/size options
- **Email Collection**: Email collected during landing for access control and order tracking
- **One Order Per Email**: Database-enforced limit of one order per email address
- **Fixed Shipping Address**: All orders ship to a single configured address
- **Admin Dashboard**: View and export orders to Excel

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema-cestes.sql` in your Supabase SQL Editor
3. Add your Supabase credentials to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSWORD` (optional, defaults to 'vbspine2024')

### 3. Configure Fixed Shipping Address

Update `lib/shippingConfig.ts` with the actual shipping address where all orders will be sent.

### 4. Add Products

Add your products to the `cestes_products` table via Supabase dashboard or SQL. See `VBS_CESTES_SETUP.md` for detailed product schema.

### 5. Add Product Images

Add product images to `public/images/` following the naming convention:
- Format: `VBS_{item#}_{color}.jpg`
- Example: `VBS_NKFQ4762_Black.jpg`

### 6. Add Logo

Add the VB Spine logo to `public/images/vbs-logo.png` (or .jpg, .svg, .webp)

### 7. Configure Email Whitelist

Edit `app/page.tsx` and add emails to the `ALLOWED_EMAILS` array. Default includes:
- `josh.rakosky@proforma.com`

### 8. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Site Access

**Email Whitelist**: Only whitelisted email addresses can access the site.

Default whitelisted email:
- `josh.rakosky@proforma.com`

To add more emails, edit `app/page.tsx` and add emails to the `ALLOWED_EMAILS` array.

## Order Flow

1. **Landing Page** (`/`): User enters whitelisted email address
2. **Product Selection** (`/product`): User selects one product with options
3. **Shipping** (`/shipping`): User enters shipping information (collected for records, but all orders ship to fixed address)
4. **Review** (`/review`): User reviews order before submission
5. **Confirmation** (`/confirmation`): Order confirmation with order number

## Order Number Format

Orders are numbered as: `CES-001`, `CES-002`, etc.

## Fixed Shipping Address

All orders ship to a single fixed address configured in `lib/shippingConfig.ts`. The shipping form still collects user shipping information for records, but the backend uses the fixed address for all orders.

## Admin Access

Visit `/admin` to:
- View all orders
- Export orders to Excel (two sheets: Detailed Orders and Distribution Summary)

Admin access is granted to `josh.rakosky@proforma.com` by default.

## Database Schema

- **cestes_products**: Product catalog
- **cestes_orders**: Order information (with email uniqueness constraint)
- **cestes_order_items**: Individual items in each order

See `supabase-schema-cestes.sql` for the complete schema.

## Color Scheme

VB Purple (#663399) is used throughout the application for buttons, focus rings, and accent colors.

## Documentation

- `VBS_CESTES_SETUP.md` - Detailed setup guide

## Deployment

Deploy to Vercel:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
