import { createServiceClient } from "./supabase/admin";
import { isSupabaseConfigured, STORAGE_BUCKET_PREVIEWS } from "./supabase/env";
import type { Artwork, PublicArtwork } from "./types";

export const FALLBACK_ARTWORKS: PublicArtwork[] = [
  {
    id: "b1111111-1111-4111-8111-111111111101",
    title: "After the Rain",
    artist: "Khadra Hussein Ali",
    medium: "Mixed media on canvas",
    size: "80 × 100 cm",
    price: 180,
    currency: "USD",
    status: "Available",
    inventoryStatus: "available",
    tone: "rain",
    story: "A love letter to the first green that returns after Mogadishu's rain.",
    previewUrl: null,
  },
  {
    id: "b1111111-1111-4111-8111-111111111102",
    title: "Hilaac / Lightning",
    artist: "Khadra Hussein Ali",
    medium: "Acrylic & collage",
    size: "60 × 80 cm",
    price: 145,
    currency: "USD",
    status: "Available",
    inventoryStatus: "available",
    tone: "lightning",
    story: "Electric possibility—young people turning climate anxiety into collective action.",
    previewUrl: null,
  },
  {
    id: "b1111111-1111-4111-8111-111111111103",
    title: "Seeds We Carry",
    artist: "Khadra Hussein Ali",
    medium: "Textile & ink",
    size: "50 × 70 cm",
    price: 120,
    currency: "USD",
    status: "Reserved",
    inventoryStatus: "reserved",
    story: "A portrait of girls holding stories, seeds, and futures in their hands.",
    tone: "seeds",
    previewUrl: null,
  },
  {
    id: "b1111111-1111-4111-8111-111111111104",
    title: "Blue Horizon",
    artist: "Khadra Hussein Ali",
    medium: "Digital print, edition of 20",
    size: "A2",
    price: 55,
    currency: "USD",
    status: "Available",
    inventoryStatus: "available",
    tone: "blue",
    story: "The Indian Ocean as witness, provider, and a horizon worth protecting.",
    previewUrl: null,
  },
];

function previewPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET_PREVIEWS}/${path.replace(/^\//, "")}`;
}

export function toPublicArtwork(row: Artwork): PublicArtwork | null {
  if (row.inventory_status !== "available" && row.inventory_status !== "reserved") {
    return null;
  }
  const artistRelation = Array.isArray(row.artists) ? row.artists[0] : row.artists;
  return {
    id: row.id,
    title: row.title,
    artist: artistRelation?.display_name || "Creative for Climate",
    medium: row.medium,
    size: row.dimensions,
    price: Number(row.price),
    currency: row.currency || "USD",
    status: row.inventory_status === "reserved" ? "Reserved" : "Available",
    inventoryStatus: row.inventory_status,
    tone: row.preview_tone || "rain",
    story: row.story,
    previewUrl: previewPublicUrl(row.preview_path),
  };
}

/**
 * Public gallery query — never selects original_path.
 */
export async function getPublicArtworks(): Promise<PublicArtwork[]> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return FALLBACK_ARTWORKS;
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("artworks")
      .select(
        "id, artist_id, title, medium, dimensions, story, price, currency, inventory_status, publish_status, preview_path, preview_tone, sort_order, created_at, updated_at, artists(display_name)"
      )
      .eq("publish_status", "published")
      .in("inventory_status", ["available", "reserved"])
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      console.warn("[gallery] Supabase fetch failed or empty; using fallback seed.", error?.message);
      return FALLBACK_ARTWORKS;
    }

    // Supabase infers relation selections as arrays; this query returns one artist per artwork.
    return (data as unknown as Artwork[])
      .map(toPublicArtwork)
      .filter((item): item is PublicArtwork => Boolean(item));
  } catch (error) {
    console.warn("[gallery] Supabase unavailable; using fallback seed.", error);
    return FALLBACK_ARTWORKS;
  }
}
