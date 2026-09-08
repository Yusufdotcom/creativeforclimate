import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "./supabase/server";
import { isSupabaseConfigured, STORAGE_BUCKET_PREVIEWS } from "./supabase/env";
import type { PublicArtwork } from "./types";

export const FALLBACK_ARTWORKS: PublicArtwork[] = [
  {
    id: "b1111111-1111-4111-8111-111111111101",
    title: "Ocean Without Plastic",
    artist: "Creative for Climate Youth Artist",
    medium: "Acrylic on canvas",
    size: "Original artwork",
    price: 65,
    currency: "USD",
    status: "Available",
    inventoryStatus: "available",
    tone: "ocean",
    story: "A young artist's call to protect ocean life: a sea turtle swims through a bottle-shaped sea beneath the words ‘Stop Pollution.’",
    previewUrl: "/artworks/ocean-without-plastic.jpeg",
  },
  {
    id: "b1111111-1111-4111-8111-111111111102",
    title: "Water Is Life",
    artist: "Creative for Climate Youth Artist",
    medium: "Acrylic on canvas",
    size: "Original artwork",
    price: 75,
    currency: "USD",
    status: "Available",
    inventoryStatus: "available",
    tone: "water",
    story: "A climate story in two landscapes: polluted water on one side, drought on the other—and a young person carrying hope between them.",
    previewUrl: "/artworks/water-is-life.jpeg",
  },
];

type GalleryRow = {
  id: string;
  title: string;
  medium: string;
  dimensions: string;
  story: string;
  price: number | string;
  currency: string;
  inventory_status: "available" | "reserved";
  preview_path: string | null;
  preview_tone: string | null;
  artists: { display_name: string } | { display_name: string }[] | null;
};

function previewPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/")) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET_PREVIEWS}/${path.replace(/^\//, "")}`;
}

function artistName(artists: GalleryRow["artists"]): string {
  if (!artists) return "Creative for Climate";
  if (Array.isArray(artists)) return artists[0]?.display_name || "Creative for Climate";
  return artists.display_name || "Creative for Climate";
}

function mapRow(row: GalleryRow): PublicArtwork {
  return {
    id: row.id,
    title: row.title,
    artist: artistName(row.artists),
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
  if (!isSupabaseConfigured()) {
    return FALLBACK_ARTWORKS;
  }

  try {
    let client;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );
    } else {
      client = await createServerSupabase();
    }

    const { data, error } = await client
      .from("artworks")
      .select(
        "id, title, medium, dimensions, story, price, currency, inventory_status, preview_path, preview_tone, artists(display_name)"
      )
      .eq("publish_status", "published")
      .in("inventory_status", ["available", "reserved"])
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      console.warn("[gallery] Supabase fetch failed or empty; using fallback seed.", error?.message);
      return FALLBACK_ARTWORKS;
    }

    return (data as GalleryRow[]).map(mapRow);
  } catch (error) {
    console.warn("[gallery] Supabase unavailable; using fallback seed.", error);
    return FALLBACK_ARTWORKS;
  }
}
