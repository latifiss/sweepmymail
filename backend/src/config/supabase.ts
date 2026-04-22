import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Supabase environment variables are missing. Database calls will fail until configured.");
}

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(env.SUPABASE_URL);

export const supabase = createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

