/**
 * Public site configuration read from environment variables.
 * Safe development fallbacks keep local `npm run dev` working without a .env file.
 *
 * PRODUCTION PHASE (add later — do not wire secrets into the client bundle):
 * - Supabase / Postgres for artworks, pending orders, custom requests
 * - Private object storage for original artwork files
 * - Email / SMS notifications after manual payment review
 * - Admin authentication before exposing the operations panel
 */

export const HORMUUD_RECIPIENT_NUMBER =
  process.env.NEXT_PUBLIC_HORMUUD_RECIPIENT_NUMBER?.trim() || "061XXXXXXX";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "hello@creativeforclimate.so";

/**
 * Phase 2 marketplace flag. Read server-side only (no NEXT_PUBLIC_ prefix).
 * Public artist onboarding stays disabled while this is false.
 */
export const MULTI_ARTIST_MARKETPLACE =
  process.env.MULTI_ARTIST_MARKETPLACE === "true";
