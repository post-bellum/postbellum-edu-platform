/**
 * Runtime environment validation
 * Import this file in your app's entry point (e.g., layout.tsx or _app.tsx)
 * to validate environment variables at runtime
 */

import { validateEnv } from "@/lib/schemas/env.schema";

// Only validate when the app actually runs, not during linting/building
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  try {
    validateEnv();
    console.log("✅ Environment variables validated successfully");
  } catch (error) {
    console.error("❌ Environment validation failed:", error);
    // In production, fail fast
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    // In development, warn but continue
    console.warn("⚠️  Continuing with invalid environment variables in development");
  }
}
