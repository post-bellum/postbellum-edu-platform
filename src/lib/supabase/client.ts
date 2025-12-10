import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

// Singleton instance for client-side
let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (client) {
    return client;
  }

  // Use env vars directly to avoid importing server code
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  client = createBrowserClient<Database>(url, anonKey);

  return client;
}
