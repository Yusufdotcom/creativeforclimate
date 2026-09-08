"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "../../../lib/admin-auth";
import { createServiceClient } from "../../../lib/supabase/admin";
import type { CustomRequestStatus } from "../../../lib/types";

export async function updateCustomRequestStatus(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as CustomRequestStatus;
  const admin_notes = String(formData.get("adminNotes") || "").trim() || null;

  if (!id || !status) throw new Error("Invalid request update");

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("custom_requests")
    .update({ status, admin_notes })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/requests");
}
