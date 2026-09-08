"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/admin";
import type { ArtistApprovalStatus } from "@/lib/types";

export async function upsertArtist(formData: FormData) {
  await requireAdminSession();
  const supabase = createServiceClient();

  const id = String(formData.get("id") || "").trim();
  const payload = {
    display_name: String(formData.get("displayName") || "").trim(),
    bio: String(formData.get("bio") || "").trim() || null,
    approval_status: String(formData.get("approvalStatus") || "approved") as ArtistApprovalStatus,
    // Phase 2: public artist profiles / marketplace. Keep false in Phase 1.5.
    public_enabled: String(formData.get("publicEnabled") || "false") === "true",
  };

  if (!payload.display_name) throw new Error("Display name is required");

  if (id) {
    const { error } = await supabase.from("artists").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("artists").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/artists");
  revalidatePath("/admin/artworks");
}
