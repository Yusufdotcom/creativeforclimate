"use server";

import { revalidatePath } from "next/cache";
import { createReferenceNumber } from "@/lib/references";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Order } from "@/lib/types";

export type OrderActionResult =
  | { ok: true; referenceNumber: string; message: string }
  | { ok: false; error: string };

export async function submitHormuudOrder(formData: FormData): Promise<OrderActionResult> {
  const artworkId = String(formData.get("artworkId") || "").trim();
  const buyerPhone = String(formData.get("buyerPhone") || "").trim();
  const buyerEmail = String(formData.get("buyerEmail") || "").trim();

  if (!artworkId) return { ok: false, error: "Missing artwork." };
  if (!buyerPhone || buyerPhone.length < 7) {
    return { ok: false, error: "Enter a valid Hormuud phone number." };
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      error: "Orders cannot be saved until Supabase is configured. See SUPABASE_SETUP.md.",
    };
  }

  const referenceNumber = createReferenceNumber("ORD");
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("create_pending_hormuud_order", {
    p_artwork_id: artworkId,
    p_buyer_phone: buyerPhone,
    p_buyer_email: buyerEmail || null,
    p_reference_number: referenceNumber,
  });

  if (error) {
    return { ok: false, error: error.message || "Could not create pending order." };
  }

  const order = data as Order | null;
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");

  return {
    ok: true,
    referenceNumber: order?.reference_number || referenceNumber,
    message:
      "Your order is pending manual payment verification. An administrator will confirm your Hormuud payment using the contact details you provided.",
  };
}
