/* eslint-disable no-console */
import { z } from 'zod';

/**
 * Environment variable schema
 * This validates all environment variables at startup
 * 
 * Note: Uses console for startup logging before logger is available.
 */
export const envSchema = z.object({
  // Public Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required'),
  
  // Service role key for server-side admin operations (e.g., account deletion)
  // Required in production, optional in development
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Service role key is required for admin operations').optional(),
  
  // Schools registry data URL (required for schools import)
  SCHOOLS_REGISTRY_URL: z.string().url('Invalid schools registry URL'),
  
  // QA Testing Configuration (optional)
  // Pattern to match QA emails (e.g., "\\+qa" matches emails like test+qa@example.com)
  NEXT_PUBLIC_QA_EMAIL_PATTERN: z.string().optional(),
  // OTP code that bypasses verification for QA emails
  NEXT_PUBLIC_QA_OTP_CODE: z.string().length(6).optional(),
  
  // Node environment
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates and returns typed environment variables
 * Throws an error if validation fails
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
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
