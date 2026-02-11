// Re-export everything for cleaner imports

// ⚠️ WARNING: Do not import from this file in Client Components!
// This file exports both server and client code, which can cause issues.
// 
// In Client Components, import directly from:
// - @/lib/supabase/client
// - @/lib/supabase/auth-helpers-client
// - @/lib/supabase/hooks/useAuth
//
// In Server Components, import directly from:
// - @/lib/supabase/server
// - @/lib/supabase/auth-helpers

export { createClient as createServerClient } from './server';
export { createClient as createBrowserClient } from './client';
export * from './auth-helpers';
export * from './auth-helpers-client';
export { supabaseConfig, authConfig } from './config';
export { useAuth } from './hooks/useAuth';

// Note: Always use createServerClient or createBrowserClient explicitly
// to avoid runtime errors and ensure proper type checking
