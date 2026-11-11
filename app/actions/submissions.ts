"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createReferenceNumber } from "@/lib/references";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, STORAGE_BUCKET_ORIGINALS } from "@/lib/supabase/env";

export type SubmissionResult =
  | { ok: true; referenceNumber: string; message: string }
  | { ok: false; error: string };

// Matches the public artwork-previews bucket so an approved image can be
// published without conversion.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function text(formData: FormData, key: string, max: number): string {
  return String(formData.get(key) || "").trim().slice(0, max);
}

/**
 * Public: an external artist offers one artwork for the gallery.
 * The image goes to the PRIVATE originals bucket and the row starts as "new";
 * nothing is visible on the site until an admin approves it.
 */
export async function submitArtwork(formData: FormData): Promise<SubmissionResult> {
  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("website") || "").trim()) {
    return { ok: false, error: "Could not submit. Please try again." };
  }

  const artistName = text(formData, "artistName", 120);
  const phone = text(formData, "phone", 40);
  const email = text(formData, "email", 200);
  const artistBio = text(formData, "artistBio", 1000);
  const title = text(formData, "title", 160);
  const medium = text(formData, "medium", 120);
  const dimensions = text(formData, "dimensions", 120);
  const story = text(formData, "story", 2000);
  const priceRaw = text(formData, "askingPrice", 20);
  const rightsConfirmed = formData.get("rightsConfirmed") === "on";
  const image = formData.get("image");

  if (!artistName || !phone || !title || !medium || !dimensions || !story) {
    return { ok: false, error: "Please complete the required fields." };
  }
  if (!rightsConfirmed) {
    return { ok: false, error: "Please confirm that this is your own original work." };
  }

  const askingPrice = priceRaw ? Number(priceRaw) : null;
  if (askingPrice !== null && (!Number.isFinite(askingPrice) || askingPrice < 0)) {
    return { ok: false, error: "Price must be a positive number." };
  }

  if (!(image instanceof File) || image.size === 0) {
    return { ok: false, error: "Please attach a photo of your artwork." };
  }
  const ext = IMAGE_EXTENSIONS[image.type];
  if (!ext) {
    return { ok: false, error: "The photo must be a JPG, PNG or WebP image." };
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "The photo must be 5 MB or smaller." };
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      error: "Submissions cannot be saved until Supabase is configured. See SUPABASE_SETUP.md.",
    };
  }

  const supabase = createServiceClient();
  const imagePath = `submissions/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET_ORIGINALS)
    .upload(imagePath, Buffer.from(await image.arrayBuffer()), {
      contentType: image.type,
      upsert: false,
    });
  if (uploadError) {
    return { ok: false, error: "Could not upload the photo. Please try again." };
  }

  const referenceNumber = createReferenceNumber("SUB");
  const { error } = await supabase.from("artwork_submissions").insert({
    reference_number: referenceNumber,
    artist_name: artistName,
    phone,
    email: email || null,
    artist_bio: artistBio || null,
    title,
    medium,
    dimensions,
    story,
    asking_price: askingPrice,
    image_path: imagePath,
    rights_confirmed: true,
    status: "new",
  });

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET_ORIGINALS).remove([imagePath]);
    console.error("[submissions] insert failed:", error.message);
    return { ok: false, error: "Could not save your submission. Please try again later." };
  }

  revalidatePath("/admin/submissions");

  return {
    ok: true,
    referenceNumber,
    message:
      "Mahadsanid! Your artwork was received. The studio will review it and contact you before it appears in the gallery.",
  };
}
