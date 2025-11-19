import { z } from "zod";

/**
 * Environment variable schema
 * This validates all environment variables at startup
 */
export const envSchema = z.object({
  // Public Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key is required"),
  
  // Optional service role key for server-side operations
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  
  // Node environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates and returns typed environment variables
 * Throws an error if validation fails
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  
  return parsed.data;
}

/**
 * Validates environment variables only in production or when explicitly needed
 * Use this for optional validation that shouldn't block development tools
 */
export function validateEnvIfNeeded(): Env | NodeJS.ProcessEnv {
  // Skip validation for development tools
  if (process.env.NODE_ENV === 'test' || process.env.CI) {
    return process.env;
  }
  
  // Always validate in production
  if (process.env.NODE_ENV === 'production') {
    return validateEnv();
  }
  
  // In development, try to validate but don't fail
  try {
    return validateEnv();
  } catch {
    console.warn('⚠️  Environment validation skipped in development');
    return process.env;
  }
}
