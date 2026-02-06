# VB Spine (CESTES) Ecommerce Setup

## Overview
This is an ecommerce site specifically for VB Spine. It features:
- Email whitelist-based site access
- Single product selection
- Email collection during shipping
- One order per email enforcement
- All orders ship to a single fixed address
- Separate database tables for CESTES

## Database Setup

### 1. Run the SQL Schema
Execute the SQL file `supabase-schema-cestes.sql` in your Supabase SQL Editor to create:
- `cestes_products` - Product catalog
- `cestes_orders` - Order information (with email uniqueness constraint)
- `cestes_order_items` - Individual items in each order

### 2. Add Your Products
Add products to the `cestes_products` table via Supabase dashboard or SQL. Products should have:
- `name`: Product name
- `description`: Product description (optional)
- `category`: Default to 'product' (single category)
- `requires_color`: boolean
- `requires_size`: boolean
- `available_colors`: array of strings (if requires_color is true)
- `available_sizes`: array of strings (if requires_size is true)
- `thumbnail_url`: Main product image
- `thumbnail_url_black`: Black color variant image (optional)
- `thumbnail_url_white`: White color variant image (optional)
- `color_thumbnails`: JSONB object mapping colors to image URLs (optional, most flexible)
- `customer_item_number`: SKU for backend tracking (optional, should start with CES- or VBS-)
- `deco`: Decoration information (optional)

## Site Access

**Email Whitelist**: Only whitelisted email addresses can access the site.

Default whitelisted email:
- `josh.rakosky@proforma.com`

To add more emails, edit `app/page.tsx` and add emails to the `ALLOWED_EMAILS` array.

## Order Flow

1. **Landing Page** (`/`): User enters whitelisted email address
2. **Product Selection** (`/product`): User selects one product with color/size options if applicable
3. **Shipping** (`/shipping`): User enters shipping information (collected for records, but all orders ship to fixed address)
4. **Review** (`/review`): User reviews order before submission
5. **Confirmation** (`/confirmation`): Order confirmation with order number

## Order Number Format

Orders are numbered as: `CES-001`, `CES-002`, etc.

## Fixed Shipping Address

All orders ship to a single fixed address configured in `lib/shippingConfig.ts`. 

**Important**: Update the `FIXED_SHIPPING_ADDRESS` object in `lib/shippingConfig.ts` with the actual shipping address before going live.

The shipping form still collects user shipping information for records, but the backend uses the fixed address for all orders.

## Key Features

### One Order Per Email
The system enforces one order per email address. If a user tries to place a second order with the same email, they will receive an error message.

### Email Collection
Email is collected on the landing page and stored with the order. This is used for:
- Access control (whitelist)
- Duplicate order prevention
- Order tracking
- Export functionality

### Admin Access
Visit `/admin` to:
- View all orders
- Export orders to Excel (two sheets: Detailed Orders and Distribution Summary)

Admin access is granted to `josh.rakosky@proforma.com` by default.

## Image Naming Convention

Product images should follow this naming pattern:
- Format: `VBS_{item#}_{color}.jpg`
- Example: `VBS_NKFQ4762_Black.jpg`

The `customer_item_number` field in products should start with `CES-` or `VBS-` (e.g., `CES-AP-NKFQ4762`). The image utility will extract the item number and generate the correct path.

For special kits with size-specific images:
- Format: `VBS-YETI-{size}-{color}.jpg`
- Example: `VBS-YETI-08-Black.jpg`, `VBS-YETI-26-Navy.jpg`

## Color Scheme

VB Purple (#663399) is used throughout the application:
- Primary buttons
- Focus rings
- Accent colors
- Background gradients (purple-50 to indigo-50)

## File Structure

### Key Files
- `app/page.tsx` - Landing page with email whitelist authentication
- `app/product/page.tsx` - Single product selection page
- `app/shipping/page.tsx` - Shipping form (collects user info, but uses fixed address)
- `app/review/page.tsx` - Review page for single product
- `app/api/orders/route.ts` - Order API using cestes tables
- `app/admin/page.tsx` - Admin page using cestes tables
- `supabase-schema-cestes.sql` - Database schema
- `lib/shippingConfig.ts` - Fixed shipping address configuration
- `lib/imageUtils.ts` - Image path generation utilities
- `components/VBSLogo.tsx` - VB Spine logo component

## Environment Variables

Optional environment variable:
- `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin page password (default: `vbspine2024`)

## Testing Checklist

- [ ] Database schema runs successfully
- [ ] Products can be added to `cestes_products`
- [ ] Email whitelist authentication works
- [ ] Product selection page loads products
- [ ] Shipping page collects user information
- [ ] Order submission creates order in `cestes_orders` with fixed shipping address
- [ ] Duplicate email prevention works
- [ ] Order numbers follow CES-XXX format
- [ ] Admin page loads orders from cestes tables
- [ ] Excel export works correctly
- [ ] Logo component displays (or shows fallback text)
- [ ] All pages display VB Purple color scheme

## Next Steps

1. Run the SQL schema in Supabase
2. Update `lib/shippingConfig.ts` with actual shipping address
3. Add your actual products to `cestes_products` table
4. Add product images to `public/images/` following VBS naming convention
5. Add VBS logo image to `public/images/vbs-logo.png` (or .jpg, .svg, .webp)
6. Add more emails to whitelist in `app/page.tsx` as needed
7. Test the full order flow
8. Update branding/text as needed
