"use client"

import { createClient } from "./client"
import { logger } from "@/lib/logger"

/**
 * Get display name from OAuth user metadata
 * Tries to extract full_name, name, or falls back to email username
 */
export async function getDisplayNameFromAuth(): Promise<string> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return ""
    
    // Try to get name from user metadata (OAuth providers)
    const metadata = user.user_metadata
    
    // Try full_name first (Google, Azure)
    if (metadata?.full_name) {
      return metadata.full_name.trim()
    }
    
    // Try name (some providers)
    if (metadata?.name) {
      return metadata.name.trim()
    }
    
    // Try first_name + last_name
    if (metadata?.first_name || metadata?.last_name) {
      const firstName = metadata?.first_name || ""
      const lastName = metadata?.last_name || ""
      return `${firstName} ${lastName}`.trim()
    }
    
    // Fallback to email username (before @)
    if (user.email) {
      return user.email.split("@")[0]
    }
    
    return ""
  } catch (error) {
    logger.error("Error getting display name from auth", error)
    return ""
  }
}

/**
 * Get user's email
 */
export async function getUserEmail(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email || null
  } catch (error) {
    logger.error("Error getting user email", error)
    return null
  }
}

