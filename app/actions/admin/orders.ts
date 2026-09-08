"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/admin";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

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
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) throw new Error(orderError?.message || "Order not found");
  if (order.order_status !== "pending") throw new Error("Order already reviewed");

  const payment_status: PaymentStatus = decision === "approve" ? "verified" : "rejected";
  const order_status: OrderStatus = decision === "approve" ? "approved" : "rejected";

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status,
      order_status,
      reviewed_by: admin.email,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) throw new Error(updateError.message);

  const inventory_status = decision === "approve" ? "sold" : "available";
  await supabase.from("artworks").update({ inventory_status }).eq("id", order.artwork_id);

  revalidateAdmin();
}
