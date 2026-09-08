"use server";

import { revalidatePath } from "next/cache";
import { createReferenceNumber } from "@/lib/references";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type CustomRequestResult =
  | { ok: true; referenceNumber: string; message: string }
  | { ok: false; error: string };

export async function submitCustomRequest(formData: FormData): Promise<CustomRequestResult> {
  const requestedArtwork = String(formData.get("requestedArtwork") || "").trim();
  const themeMessage = String(formData.get("themeMessage") || "").trim();
  const preferredSize = String(formData.get("preferredSize") || "").trim();
  const style = String(formData.get("style") || "").trim();
  const budgetRaw = String(formData.get("budget") || "").trim();
  const deadline = String(formData.get("deadline") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!requestedArtwork || !themeMessage || !name || !phone) {
    return { ok: false, error: "Please complete the required fields." };
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      error: "Requests cannot be saved until Supabase is configured. See SUPABASE_SETUP.md.",
    };
  }

  const budget = budgetRaw ? Number(budgetRaw) : null;
  if (budgetRaw && Number.isNaN(budget)) {
    return { ok: false, error: "Budget must be a number." };
  }

  const referenceNumber = createReferenceNumber("REQ");
  const supabase = createServiceClient();

  const { error } = await supabase.from("custom_requests").insert({
    reference_number: referenceNumber,
    requested_artwork: requestedArtwork,
    theme_message: themeMessage,
    preferred_size: preferredSize || null,
    style: style || null,
    budget,
    deadline: deadline || null,
    name,
    phone,
    email: email || null,
    status: "new",
  });

  if (error) {
    return { ok: false, error: error.message || "Could not save your request." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/requests");

  return {
    ok: true,
    referenceNumber,
    message: "Mahadsanid! Your custom-art request was received and is awaiting studio review.",
  };
}
