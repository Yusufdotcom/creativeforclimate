"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET_ORIGINALS, STORAGE_BUCKET_PREVIEWS } from "@/lib/supabase/env";
import type { InventoryStatus, PublishStatus } from "@/lib/types";

function revalidateArt() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/artworks");
}

export async function upsertArtwork(formData: FormData) {
  await requireAdminSession();
  const supabase = createServiceClient();

  const id = String(formData.get("id") || "").trim();
  const payload = {
    artist_id: String(formData.get("artistId") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    medium: String(formData.get("medium") || "").trim(),
    dimensions: String(formData.get("dimensions") || "").trim(),
    story: String(formData.get("story") || "").trim(),
    price: Number(formData.get("price") || 0),
    currency: String(formData.get("currency") || "USD").trim() || "USD",
    inventory_status: String(formData.get("inventoryStatus") || "available") as InventoryStatus,
    publish_status: String(formData.get("publishStatus") || "draft") as PublishStatus,
    preview_tone: String(formData.get("previewTone") || "rain").trim() || "rain",
    sort_order: Number(formData.get("sortOrder") || 0),
    preview_path: String(formData.get("previewPath") || "").trim() || null,
    original_path: String(formData.get("originalPath") || "").trim() || null,
  };

  if (!payload.artist_id || !payload.title || !payload.medium || !payload.dimensions) {
    throw new Error("Artist, title, medium and dimensions are required.");
  }

  if (id) {
    const { error } = await supabase.from("artworks").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("artworks").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidateArt();
}

export async function setArtworkInventory(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  const inventory_status = String(formData.get("inventoryStatus") || "") as InventoryStatus;
  if (!id || !inventory_status) throw new Error("Invalid inventory update");

  const supabase = createServiceClient();
  const { error } = await supabase.from("artworks").update({ inventory_status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateArt();
}

export async function setArtworkPublish(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  const publish_status = String(formData.get("publishStatus") || "") as PublishStatus;
  if (!id || !publish_status) throw new Error("Invalid publish update");

  const supabase = createServiceClient();
  const { error } = await supabase.from("artworks").update({ publish_status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateArt();
}

/**
 * Upload workflow (documented in SUPABASE_SETUP.md):
 * 1. Admin uploads a watermarked/resized preview → public artwork-previews bucket
 * 2. Admin uploads the original → private artwork-originals bucket
 * 3. Paths are stored on the artwork row; original_path is never exposed publicly
 */
export async function uploadArtworkAsset(formData: FormData) {
  await requireAdminSession();
  const artworkId = String(formData.get("artworkId") || "");
  const kind = String(formData.get("kind") || "") as "preview" | "original";
  const file = formData.get("file");

  if (!artworkId || (kind !== "preview" && kind !== "original")) {
    throw new Error("Invalid upload");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload");
  }

  const bucket = kind === "preview" ? STORAGE_BUCKET_PREVIEWS : STORAGE_BUCKET_ORIGINALS;
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${artworkId}/${kind}-${Date.now()}.${ext}`;
  const supabase = createServiceClient();

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw new Error(uploadError.message);

  const column = kind === "preview" ? "preview_path" : "original_path";
  const { error } = await supabase.from("artworks").update({ [column]: path }).eq("id", artworkId);
  if (error) throw new Error(error.message);

  revalidateArt();
}
