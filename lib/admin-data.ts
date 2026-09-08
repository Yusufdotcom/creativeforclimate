import { requireAdminSession } from "./admin-auth";
import { createServiceClient } from "./supabase/admin";
import type { Artist, Artwork, CustomRequest, Order } from "./types";

type ArtworkQueryRow = Omit<Artwork, "artists" | "price"> & {
  price: number | string;
  artists: Pick<Artist, "display_name"> | Pick<Artist, "display_name">[] | null;
};

function normalizeArtwork(row: ArtworkQueryRow): Artwork {
  const artists = Array.isArray(row.artists) ? row.artists[0] || null : row.artists;
  return {
    ...row,
    artists,
    price: Number(row.price),
  };
}

export async function loadAdminDashboard() {
  await requireAdminSession();
  const supabase = createServiceClient();

  const [orders, artworks, requests, artists] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase
      .from("artworks")
      .select(
        "id, artist_id, title, medium, dimensions, story, price, currency, inventory_status, publish_status, preview_path, original_path, preview_tone, sort_order, created_at, updated_at, artists(display_name)"
      )
      .order("sort_order", { ascending: true }),
    supabase.from("custom_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("artists").select("*").order("display_name", { ascending: true }),
  ]);

  return {
    orders: (orders.data || []) as Order[],
    artworks: ((artworks.data || []) as unknown as ArtworkQueryRow[]).map(normalizeArtwork),
    requests: (requests.data || []) as CustomRequest[],
    artists: (artists.data || []) as Artist[],
    errors: {
      orders: orders.error?.message,
      artworks: artworks.error?.message,
      requests: requests.error?.message,
      artists: artists.error?.message,
    },
  };
}
