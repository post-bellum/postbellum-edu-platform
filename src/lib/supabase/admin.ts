import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Creates a Supabase admin client with service role key
 * 
 * ⚠️ WARNING: This client bypasses Row Level Security!
 * Only use in secure server-side contexts like:
 * - API routes
 * - Server actions
 * - Background jobs
 * 
 * NEVER import or use this in:
 * - Client components
 * - Pages that could be rendered on client
 * - Any code that might be bundled for browser
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin credentials");
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Example usage in an API route:
// export async function POST() {
//   const supabase = createAdminClient();
//   // Now you can bypass RLS for admin operations
//   const { data, error } = await supabase
//     .from('users')
//     .update({ role: 'admin' })
//     .eq('id', userId);
// }
