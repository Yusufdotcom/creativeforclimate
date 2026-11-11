"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/admin";

function revalidateAdmin() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/artworks");
}

export async function reviewOrder(formData: FormData) {
  const admin = await requireAdminSession();
  const orderId = String(formData.get("orderId") || "");
  const decision = String(formData.get("decision") || "") as "approve" | "reject";

  if (!orderId || (decision !== "approve" && decision !== "reject")) {
    throw new Error("Invalid order review");
  }

  const supabase = createServiceClient();
  const { error } = await supabase.rpc("review_hormuud_order", {
    p_order_id: orderId,
    p_decision: decision,
    p_reviewed_by: admin.email,
  });
  if (error) throw new Error(error.message);

  revalidateAdmin();
}
