import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Create a public Supabase client without cookies
 * Use this for static pages where we don't need authentication
 * RLS policies will still work - public users will only see published content
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file."
    )
  }

  return createSupabaseClient<Database>(url, anonKey)
}

