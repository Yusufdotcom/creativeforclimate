"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET_ORIGINALS, STORAGE_BUCKET_PREVIEWS } from "@/lib/supabase/env";
import type { ArtworkSubmission } from "@/lib/types";

function revalidateSubmissions() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/artworks");
  revalidatePath("/admin/artists");
}

/**
 * Approve a submission: creates (or reuses) the artist, copies the image into
 * the public previews bucket and creates the artwork — published or as a draft.
 */
export async function approveSubmission(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("id") || "");
  const publishStatus = formData.get("publishStatus") === "published" ? "published" : "draft";
  const existingArtistId = String(formData.get("artistId") || "").trim();
  const price = Number(formData.get("price"));

  if (!id) throw new Error("Invalid submission");
  if (!Number.isFinite(price) || price < 0) throw new Error("Enter a valid price before approving.");

  const supabase = createServiceClient();

  // Claim the row first so a double click cannot create two artworks.
  const { data: claimed, error: claimError } = await supabase
    .from("artwork_submissions")
    .update({ status: "approved", reviewed_by: session.email, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "new")
    .select("*")
    .maybeSingle();
  if (claimError) throw new Error(claimError.message);
  if (!claimed) throw new Error("This submission was already reviewed.");
  const submission = claimed as ArtworkSubmission;

  let createdArtistId: string | null = null;
  let previewPath: string | null = null;

  try {
    let artistId = existingArtistId;
    if (!artistId) {
      const { data: artist, error } = await supabase
        .from("artists")
        .insert({
          display_name: submission.artist_name,
          bio: submission.artist_bio,
          approval_status: "approved",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      artistId = artist.id as string;
      createdArtistId = artistId;
    }

    const { data: file, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET_ORIGINALS)
      .download(submission.image_path);
    if (downloadError || !file) throw new Error(downloadError?.message || "Submitted image is missing.");

    const ext = submission.image_path.split(".").pop() || "jpg";
    previewPath = `submissions/${submission.id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET_PREVIEWS)
      .upload(previewPath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (uploadError) throw new Error(uploadError.message);

    const { data: artwork, error: artworkError } = await supabase
      .from("artworks")
      .insert({
        artist_id: artistId,
        title: submission.title,
        medium: submission.medium,
        dimensions: submission.dimensions,
        story: submission.story,
        price,
        currency: submission.currency || "USD",
        inventory_status: "available",
        publish_status: publishStatus,
        preview_path: previewPath,
        original_path: submission.image_path,
        sort_order: 100,
      })
      .select("id")
      .single();
    if (artworkError) throw new Error(artworkError.message);

    await supabase.from("artwork_submissions").update({ artwork_id: artwork.id }).eq("id", id);
  } catch (error) {
    // Undo so the submission can be reviewed again.
    if (previewPath) await supabase.storage.from(STORAGE_BUCKET_PREVIEWS).remove([previewPath]);
    if (createdArtistId) await supabase.from("artists").delete().eq("id", createdArtistId);
    await supabase
      .from("artwork_submissions")
      .update({ status: "new", reviewed_by: null, reviewed_at: null })
      .eq("id", id);
    throw error;
  }

  revalidateSubmissions();
}

export async function declineSubmission(formData: FormData) {
  const session = await requireAdminSession();
  const id = String(formData.get("id") || "");
  const adminNotes = String(formData.get("adminNotes") || "").trim();
  if (!id) throw new Error("Invalid submission");

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("artwork_submissions")
    .update({
      status: "declined",
      admin_notes: adminNotes || null,
      reviewed_by: session.email,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "new");
  if (error) throw new Error(error.message);

  revalidateSubmissions();
}
