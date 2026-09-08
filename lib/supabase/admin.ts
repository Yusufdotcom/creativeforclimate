import { createClient } from "@supabase/supabase-js";
import { requireServiceRoleKey, requireSupabasePublicEnv } from "./env";

/** Privileged server-only client. Never import into client components. */
export function createServiceClient() {
  const { url } = requireSupabasePublicEnv();
  const serviceKey = requireServiceRoleKey();
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
