# Deploy Creative for Climate to Vercel

## 1. Push the project

Commit this repository (excluding secrets) and push it to GitHub, GitLab, or Bitbucket.

## 2. Import on Vercel

1. Open [vercel.com](https://vercel.com) and create a new project from the repo.
2. Framework Preset: **Next.js** (auto-detected).
3. Build command: `npm run build`
4. Output: leave default (Next.js handles this).
5. Deploy.

Local scripts that must work before and after deploy:

```bash
npm install
npm run build
npm run start   # production server locally
npm run dev     # development
```

## 3. Environment variables

In the Vercel project → **Settings → Environment Variables**, set:

| Name | Example | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_HORMUUD_RECIPIENT_NUMBER` | `061XXXXXXX` | Shown in the Hormuud payment steps |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `hello@creativeforclimate.so` | Footer / mailto link |
| `MULTI_ARTIST_MARKETPLACE` | `false` | Keep `false` until Phase 2 |

Copy values from `.env.example`. Redeploy after changing env vars so `NEXT_PUBLIC_*` values are baked into the client bundle.

Do **not** add payment API keys, database URLs, or admin secrets until the production phase.

## 4. Custom domain (later)

1. Vercel project → **Settings → Domains**.
2. Add e.g. `creativeforclimate.so` and `www.creativeforclimate.so`.
3. Follow Vercel’s DNS instructions at your registrar (A/CNAME or nameservers).
4. Wait for SSL to provision (usually automatic).

## 5. What this deploy does *not* include yet

Manual payment only: **Waan bixiyay** creates a **pending** order in the UI. There is no automatic payment verification.

**PRODUCTION PHASE — add later:**

- **Supabase / Postgres** — persist artworks, pending orders, custom requests
- **Storage** — private originals + public watermarked previews
- **Email / SMS** — notify buyers after an admin reviews payment
- **Admin authentication** — protect the operations panel before real use

## 6. Smoke check after deploy

1. Homepage loads with the existing visual experience.
2. Gallery → Buy → Hormuud steps show your recipient number from env.
3. Submit **Waan bixiyay** → success copy says the order is **pending manual verification**.
4. Footer email matches `NEXT_PUBLIC_CONTACT_EMAIL`.
