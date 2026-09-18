# Digital Product Store — Next.js + Supabase + Razorpay

A simple, production-oriented starter for selling PDFs, ZIPs, templates, ebooks and other digital assets.

## Features

- Clean customer storefront
- Dynamic product pages
- Product overview, pricing and FAQ
- Razorpay checkout (INR)
- Server-side payment verification
- Razorpay webhook handling
- Secure, expiring download tokens
- Private Supabase Storage bucket for digital files
- Supabase PostgreSQL database
- Supabase Auth admin login
- Admin dashboard
- Add, edit, activate/draft and delete products
- Upload product files directly from the admin panel
- Order list and paid-sales total
- Responsive CSS with no UI framework required

## Architecture

```text
Customer -> Next.js Store -> Razorpay
                         -> API -> Supabase PostgreSQL
                              -> Supabase Storage (private)

Admin -> Supabase Auth -> Next.js Admin -> Supabase DB/Storage
```

## 1. Requirements

- Node.js 20+
- A Supabase project
- A Razorpay account
- A Vercel account (recommended for deployment)

## 2. Install

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 3. Configure Supabase

In Supabase SQL Editor, run:

```text
supabase/migrations/001_schema.sql
```

Optionally run `supabase/seed.sql` to create a draft demo product.

The migration creates:

- `products`
- `orders`
- `download_tokens`
- private `digital-products` Storage bucket
- public read policy for active products

### Create your admin user

In Supabase Dashboard -> Authentication -> Users, create an email/password user.

Set the same email in `ADMIN_EMAIL` in `.env.local`.

The app intentionally keeps admin authorization simple: only the configured `ADMIN_EMAIL` can access the admin routes.

## 4. Environment variables

Copy:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
DOWNLOAD_TOKEN_TTL_MINUTES=30
ADMIN_EMAIL=admin@example.com
```

**Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code or commit `.env.local`.**

## 5. Razorpay setup

For local development, use Razorpay test keys.

Configure the webhook endpoint:

```text
https://YOUR-DOMAIN.com/api/payment/webhook
```

Use the same secret as `RAZORPAY_WEBHOOK_SECRET`.

At minimum, enable the payment-captured event.

## 6. Customer flow

1. Customer opens `/products/product-slug`.
2. Clicks **Buy Now**.
3. Enters name and email.
4. Server creates a Razorpay order using the database product price.
5. Razorpay Checkout opens.
6. Razorpay returns payment details.
7. Server verifies the Razorpay payment signature.
8. Order is marked `paid`.
9. A random download token is created.
10. Customer is redirected to `/payment/success?token=...`.
11. The download page validates the token.
12. The server creates a short-lived Supabase signed URL and redirects to it.

The file itself remains private in Supabase Storage.

## 7. Admin flow

Open:

```text
/admin/login
```

Sign in with the Supabase Auth user whose email matches `ADMIN_EMAIL`.

Admin pages:

```text
/admin
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/orders
```

When adding a product, you can upload the digital file directly. The server uploads it to the private `digital-products` bucket and stores only its path in the `products.file_path` column.

## 8. Storage

The app expects this private bucket:

```text
digital-products/
  products/
    timestamp-file.pdf
```

Do not make the bucket public. Downloads are generated with temporary signed URLs.

## 9. Important production notes

### Payment truth

The server must be the source of truth. Never unlock a file merely because the browser says payment succeeded.

The project verifies the Razorpay checkout signature and also includes a webhook endpoint for payment-captured events.

### Webhook idempotency

For a larger production store, add a unique event table or a stronger idempotency mechanism for Razorpay webhook event IDs. This starter prevents duplicate paid-state transitions but can be hardened further for high-volume payments.

### Download protection

Tokens expire according to `DOWNLOAD_TOKEN_TTL_MINUTES`. The actual Storage URL is only valid for 10 minutes after the token is validated.

For high-value assets, consider adding download limits, customer authentication, email delivery, and stronger anti-abuse controls.

### Admin security

Use a strong Supabase Auth password and protect the admin account with MFA in production. For multiple administrators, replace the single `ADMIN_EMAIL` check with an `admin_profiles` table and role-based authorization.

## 10. Deployment to Vercel

1. Push this project to GitHub.
2. Import it into Vercel.
3. Add every `.env.example` variable in Vercel Project Settings -> Environment Variables.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL.
5. Deploy.
6. Update the Razorpay webhook URL to the production `/api/payment/webhook` URL.

## 11. Project structure

```text
app/
  (store)/             Customer pages
  admin/               Admin pages
  api/                 Backend route handlers
components/            Reusable UI components
lib/supabase/          Supabase browser/server/admin clients
lib/                   Payment, storage and business helpers
supabase/migrations/   Database schema
public/                Public static assets
types/                 TypeScript types
```

## 12. Build

```bash
npm run build
npm start
```

## 13. What this intentionally does not include

To keep V1 simple, there is no customer account system, cart, coupons, subscriptions, reviews, multi-vendor support, or complicated CMS.

Those can be added later without changing the basic payment -> verification -> secure download architecture.

## Admin login troubleshooting

The admin login uses **Supabase Auth email/password**. The login page is:

```text
/admin/login
```

Create the admin user in Supabase Dashboard -> Authentication -> Users. Then set the exact same email in `.env.local`:

```env
ADMIN_EMAIL=your-real-admin-email@example.com
```

Restart the Next.js development server after changing environment variables.

The middleware refreshes the Supabase SSR session and protects every `/admin/*` route except `/admin/login`. After a successful login, the browser confirms the Auth session and redirects to `/admin`.

If the login page appears again immediately after a successful password login, check these first:

1. `NEXT_PUBLIC_SUPABASE_URL` is the URL of the same Supabase project containing the admin user.
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` belongs to that same project.
3. `ADMIN_EMAIL` exactly matches the Supabase Auth user's email (case is normalized).
4. Restart `npm run dev` after editing `.env.local`.
5. Do not use the Supabase `service_role` key as the browser/anon key.
6. Make sure your browser allows cookies/local storage for the site.

The `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be placed in `NEXT_PUBLIC_*` variables.

## Frontend redesign

The storefront and admin panel use a premium, Apple-inspired visual system: warm off-white surfaces, restrained orange/yellow accents, generous spacing, editorial typography, soft borders, subtle shadows, and minimal motion. The redesign does not change the Supabase, Razorpay, order, upload, authentication, or secure download architecture.
