"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "../../../lib/admin-auth";
import { createClient } from "../../../lib/supabase/server";
import { isApprovedAdminEmail, isSupabaseConfigured } from "../../../lib/supabase/env";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function adminLogin(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  if (!isApprovedAdminEmail(email)) {
    return { ok: false, error: "This email is not authorised for admin access." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: error.message };
  }

  redirect("/admin");
}

export async function adminLogout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function assertAdmin() {
  return requireAdminSession();
}
