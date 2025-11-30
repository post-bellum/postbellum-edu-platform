"use server"

import { createClient } from "./server"
import { logger } from "@/lib/logger"

/**
 * Check if the current user is an admin
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (error) {
      logger.error("Error checking admin status:", error)
      return false
    }
    
    return profile?.is_admin === true
  } catch (error) {
    logger.error("Error checking admin status:", error)
    return false
  }
}

/**
 * Require admin access - throws error if user is not admin
 * @throws Error if user is not admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error("Admin access required")
  }
}

