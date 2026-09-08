import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Manual Hormuud payment only for now — no payment provider integration.
  // PRODUCTION PHASE: add image remotePatterns when serving preview assets
  // from Supabase Storage or another CDN.
};

export default nextConfig;
