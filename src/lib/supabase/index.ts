// Re-export everything for cleaner imports
export { createClient as createServerClient } from "./server";
export { createClient as createBrowserClient } from "./client";
export * from "./auth-helpers";
export { supabaseConfig, authConfig } from "./config";

// Note: Always use createServerClient or createBrowserClient explicitly
// to avoid runtime errors and ensure proper type checking
