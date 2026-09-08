# Creative for Climate

A production-minded visual MVP for a youth-led climate, art, education and community initiative in Mogadishu, Somalia.

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local` and follow `SUPABASE_SETUP.md`.
3. `npm install`
4. `npm run dev`

## Phase 1.5 features

- Immersive public homepage (design preserved).
- Supabase-backed gallery, Hormuud pending orders, custom-art requests.
- Secure `/admin` with Supabase email/password auth + `ADMIN_EMAILS` allowlist.
- Private originals bucket + public watermarked previews bucket.
- Manual payment only — never auto-verified.

## Docs

- `SUPABASE_SETUP.md` — database, storage, admin user
- `DEPLOYMENT.md` — Vercel env vars and deploy steps

## Phase 2 flag

Keep `MULTI_ARTIST_MARKETPLACE=false` until artist marketplace features are intentionally enabled.
