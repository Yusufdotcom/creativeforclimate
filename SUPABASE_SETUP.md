# Supabase setup — Creative for Climate Phase 1.5

Follow these steps exactly before expecting live orders, requests, or admin data.

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a project.
2. Open **Project Settings → API**.
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (server only)

## 2. Run SQL migrations

In the Supabase SQL editor, run in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage_and_rls.sql`
3. `supabase/seed.sql`

Confirm tables exist: `artists`, `artworks`, `orders`, `custom_requests`, `inquiries`, `site_content`.

Confirm storage buckets:

- `artwork-previews` — **public** (watermarked / resized only)
- `artwork-originals` — **private** (never public)

## 3. Create an admin Auth user

1. Supabase → **Authentication → Users → Add user**.
2. Create with email/password (e.g. your studio email).
3. Put that exact email in `ADMIN_EMAILS` (comma-separated if multiple).

Unauthenticated visitors hitting `/admin` are redirected to `/admin/login`.  
Emails not listed in `ADMIN_EMAILS` cannot use the admin desk even if they can sign in to Supabase Auth.

## 4. Local environment

Copy `.env.example` → `.env.local` and fill values:

```bash
NEXT_PUBLIC_HORMUUD_RECIPIENT_NUMBER=061XXXXXXX
NEXT_PUBLIC_CONTACT_EMAIL=hello@creativeforclimate.so
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_STORAGE_BUCKET_PREVIEWS=artwork-previews
SUPABASE_SERVICE_ROLE_KEY=...
STORAGE_BUCKET_ORIGINALS=artwork-originals
ADMIN_EMAILS=you@creativeforclimate.so
MULTI_ARTIST_MARKETPLACE=false
```

Then:

```bash
npm install
npm run dev
```

Without Supabase env vars, the public site still renders using seeded fallback artworks. Order/request saves require Supabase.

## 5. Artwork file upload workflow

**Do not** create public download URLs for originals.

1. Prepare a **low-resolution, watermarked** preview image.
2. In `/admin/artworks`, upload it with **Upload preview** → stored in `artwork-previews`.
3. Upload the high-resolution original with **Upload original** → stored in `artwork-originals` (private).
4. The public gallery only reads `preview_path` (or CSS `preview_tone` when no preview file exists).
5. `original_path` is never selected in public queries and never returned to the browser.

There is intentionally **no** insecure public signed-download helper for originals in Phase 1.5. If you later need delivery after sale, generate a short-lived signed URL only inside an authenticated admin server action after payment approval.

## 6. Manual Hormuud flow reminder

1. Buyer pays via `*770#` to `NEXT_PUBLIC_HORMUUD_RECIPIENT_NUMBER`.
2. Buyer clicks **Waan bixiyay**.
3. Server creates `orders` row with:
   - `payment_method = Hormuud manual`
   - `payment_status = pending_verification`
   - `order_status = pending`
4. Artwork inventory becomes `reserved`.
5. Admin reviews in `/admin/orders` and approves or rejects. Payment is never auto-verified.

## 7. Phase 2 readiness

Schema already includes:

- `artists.public_enabled`
- `artists.approval_status`
- `artists.payout_profile`

Keep `MULTI_ARTIST_MARKETPLACE=false` until artist self-signup, dashboards, and payouts are built and reviewed.
