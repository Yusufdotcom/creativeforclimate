# Creative for Climate

A production-minded visual MVP for a youth-led climate, art, education and community initiative in Mogadishu, Somalia.

## Run locally

1. Install Node.js 20+.
2. In this folder, run `npm install`.
3. Run `npm run dev` and open the local URL shown in the terminal.

## What is included

- Immersive, responsive homepage with About, Mission/Vision, programs, impact, partnerships and contact.
- Editorial art gallery with detailed artwork records: title, artist, medium, dimensions, story, price and availability.
- Watermarked, browser-generated low-value preview artwork. The preview layer blocks the normal context menu as a small deterrent only; it does not claim to prevent screenshots.
- Hormuud manual-payment interface. A buyer is shown the exact amount and recipient number, supplies contact details and confirms **Waan bixiyay**. The interface explicitly says that payment needs human verification.
- A guided custom-art request brief.
- Private MVP operations panel demonstrating order approval/rejection and artwork status changes.
- A visible Phase 2 artist marketplace placeholder that is deliberately not public.

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_HORMUUD_RECIPIENT_NUMBER`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `MULTI_ARTIST_MARKETPLACE=false`

See `DEPLOYMENT.md` for Vercel setup. Development fallbacks match the example values if env vars are unset.

## Before launch

Replace placeholder artworks when you have real preview assets. In the production phase, connect the UI to authenticated admin access, Supabase/Postgres, private storage, and email/SMS — without automatic payment verification.

## Suggested production data model

| Entity | Key fields |
| --- | --- |
| `artists` | id, displayName, bio, photo, approvalStatus, payoutProfile, publicEnabled |
| `artworks` | id, artistId, title, medium, dimensions, story, price, currency, inventoryStatus, previewAsset, originalAssetPrivate |
| `orders` | id, artworkId, buyerPhone, buyerEmail, amount, paymentMethod, paymentStatus, orderStatus, reviewedBy |
| `custom_requests` | id, customer details, brief, theme, size, style, budget, deadline, status, assignedArtistId |
| `inquiries` | id, source, name, contact, message, status |
| `site_content` | key, locale, value, publishedAt |

Keep original artwork files in private object storage and deliver them only after approval. Public URLs should point only to deliberately resized, watermarked preview derivatives. For a future zoom experience, provide server-generated tiles or temporary signed preview URLs, rather than an original image URL.

## Phase 2 feature flag

Use a server-side `MULTI_ARTIST_MARKETPLACE=false` flag. Gate artist registration, dashboard navigation, artwork submission and artist payout pages behind it. Keep the public gallery working with Creative for Climate-curated work in the meantime.
