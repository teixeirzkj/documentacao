import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses RLS via the service_role key. Only use this for trusted
// server-side flows that don't have a user session to authenticate with
// (admin user management, the n8n integration) — never expose it to the
// client.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
