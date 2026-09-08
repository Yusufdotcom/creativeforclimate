# Deploy Creative for Climate to Vercel

## 1. Prepare Supabase first

Complete `SUPABASE_SETUP.md` (migrations, seed, storage buckets, admin Auth user) before relying on live forms or `/admin`.

## 2. Push the project

Commit this repository (excluding secrets) and push it to GitHub, GitLab, or Bitbucket.

## 3. Import on Vercel

1. Open [vercel.com](https://vercel.com) and create a new project from the repo.
2. Framework Preset: **Next.js** (auto-detected).
3. Build command: `npm run build`
4. Output: leave default.
5. Add environment variables (below), then deploy.

Local scripts:

```bash
npm install
npm run build
npm run start
npm run dev
```

## 4. Exact Vercel environment variables

Add these in **Project → Settings → Environment Variables** for Production (and Preview if desired):

| Name | Required | Example / notes |
| --- | --- | --- |
| `NEXT_PUBLIC_HORMUUD_RECIPIENT_NUMBER` | yes | `061XXXXXXX` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | yes | `hello@creativeforclimate.so` |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon public key |
| `NEXT_PUBLIC_STORAGE_BUCKET_PREVIEWS` | yes | `artwork-previews` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase service role secret — **server only** |
| `STORAGE_BUCKET_ORIGINALS` | yes | `artwork-originals` |
| `ADMIN_EMAILS` | yes | Comma-separated approved admin emails |
| `MULTI_ARTIST_MARKETPLACE` | yes | `false` |

Redeploy after changing any `NEXT_PUBLIC_*` value.

Never commit `.env.local` or the service role key.

## 5. Custom domain (later)

1. Vercel project → **Settings → Domains**.
2. Add `creativeforclimate.so` / `www`.
3. Follow DNS instructions; wait for SSL.

## 6. Smoke check after deploy

1. Homepage gallery loads (from Supabase when configured).
2. Buy → Hormuud steps show recipient number from env.
3. **Waan bixiyay** returns a reference number and **pending manual verification** copy.
4. Custom art request returns a reference number.
5. `/admin` redirects to `/admin/login` when signed out.
6. Approved admin can approve/reject orders and manage artworks.
7. Public responses never include original artwork file URLs.

## 7. What remains out of Phase 1.5

- Automatic Hormuud payment verification
- Public artist self-signup / dashboards / payouts (`MULTI_ARTIST_MARKETPLACE=false`)
- Email/SMS notification providers (hook points exist in admin review flow for later)
