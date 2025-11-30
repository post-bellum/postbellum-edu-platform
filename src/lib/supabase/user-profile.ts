"use client"

import { createClient } from "./client"
import type { CompleteRegistrationData } from "@/types/user.types"
import { sanitizeInput } from "@/lib/sanitize"
import { logger } from "@/lib/logger"
import { AUTH_CONSTANTS } from "@/lib/constants"

/**
 * Check if current user has completed registration
 */
export async function hasCompletedRegistration(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    // Check profiles table for registration completion
    const { data: profile } = await supabase
      .from('profiles')
      .select('registration_completed')
      .eq('id', user.id)
      .single()
    
    return profile?.registration_completed === true
  } catch (error) {
    logger.error("Error checking registration status", error)
    return false
  }
}

/**
 * Complete user registration with additional data
 * Saves to profiles table (single source of truth)
 */
export async function completeRegistration(data: CompleteRegistrationData): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("No user logged in")
    }
    
    // Validate data based on user type
    if (data.userType === 'teacher' && !data.schoolName) {
      throw new Error("School name is required for teachers")
    }
    if (data.userType === 'not-teacher' && !data.category) {
      throw new Error("Category is required for non-teachers")
    }
    
    // Validate display name length if provided
    if (data.displayName && data.displayName.length > AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH) {
      throw new Error(`Display name must be ${AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH} characters or less`)
    }
    
    // Sanitize inputs to prevent XSS
    const sanitizedDisplayName = data.displayName ? sanitizeInput(data.displayName.trim()) : null
    const sanitizedSchoolName = data.schoolName ? sanitizeInput(data.schoolName.trim()) : null
    
    // Save to profiles table (single source of truth)
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        display_name: sanitizedDisplayName,
        user_type: data.userType,
        school_name: data.userType === 'teacher' ? sanitizedSchoolName : null,
        category: data.userType === 'not-teacher' ? data.category : null,
        terms_accepted: data.termsAccepted,
        email_consent: data.emailConsent,
        registration_completed: true,
      }, {
        onConflict: 'id'
      })
    
    if (error) {
      logger.error("Error saving profile:", error)
      throw error
    }
    
  } catch (error) {
    logger.error("Error completing registration:", error)
    throw error
  }
}

/**
 * Get user profile data from profiles table
 */
export async function getUserProfile() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    // Get from profiles table (single source of truth)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      logger.error("Error fetching profile:", error)
      return null
    }
    
    if (!profile) return null
    
    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      userType: profile.user_type,
      schoolName: profile.school_name,
      category: profile.category,
      termsAccepted: profile.terms_accepted,
      emailConsent: profile.email_consent,
      registrationCompleted: profile.registration_completed,
    }
  } catch (error) {
    logger.error("Error getting user profile:", error)
    return null
  }
}

/**
 * Update user profile display name
 * @param displayName New display name (max 32 characters)
 */
export async function updateDisplayName(displayName: string): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("No user logged in")
    }
    
    // Validate display name length
    if (displayName.length > AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH) {
      throw new Error(`Display name must be ${AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH} characters or less`)
    }
    
    // Sanitize input
    const sanitized = sanitizeInput(displayName.trim()) || null
    
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: sanitized })
      .eq('id', user.id)
    
    if (error) {
      logger.error("Error updating display name:", error)
      throw error
    }
  } catch (error) {
    logger.error("Error updating display name:", error)
    throw error
  }
}

/**
 * Update user profile
 * Allows updating display_name, email_consent, and school_name (for teachers)
 */
export async function updateProfile(updates: {
  displayName?: string
  emailConsent?: boolean
  schoolName?: string
}): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("No user logged in")
    }
    
    // Validate display name length if provided
    if (updates.displayName !== undefined && updates.displayName.length > AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH) {
      throw new Error(`Display name must be ${AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH} characters or less`)
    }
    
    const updateData: Record<string, unknown> = {}
    
    if (updates.displayName !== undefined) {
      const sanitized = sanitizeInput(updates.displayName.trim())
      updateData.display_name = sanitized || null
    }
    if (updates.emailConsent !== undefined) {
      updateData.email_consent = updates.emailConsent
    }
    if (updates.schoolName !== undefined) {
      const sanitized = sanitizeInput(updates.schoolName.trim())
      updateData.school_name = sanitized || null
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
    
    if (error) {
      logger.error("Error updating profile:", error)
      throw error
    }
  } catch (error) {
    logger.error("Error updating profile:", error)
    throw error
  }
}

