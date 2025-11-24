"use client"

import { createClient } from "./client"
import type { CompleteRegistrationData } from "@/types/user.types"

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
    console.error("Error checking registration status:", error)
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
    if (data.displayName && data.displayName.length > 32) {
      throw new Error("Display name must be 32 characters or less")
    }
    
    // Save to profiles table (single source of truth)
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        display_name: data.displayName?.trim() || null,
        user_type: data.userType,
        school_name: data.userType === 'teacher' ? data.schoolName : null,
        category: data.userType === 'not-teacher' ? data.category : null,
        email_consent: data.emailConsent,
        registration_completed: true,
      }, {
        onConflict: 'id'
      })
    
    if (error) {
      console.error("Error saving profile:", error)
      throw error
    }
    
  } catch (error) {
    console.error("Error completing registration:", error)
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
      console.error("Error fetching profile:", error)
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
      emailConsent: profile.email_consent,
      registrationCompleted: profile.registration_completed,
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
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
    if (displayName.length > 32) {
      throw new Error("Display name must be 32 characters or less")
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() || null })
      .eq('id', user.id)
    
    if (error) {
      console.error("Error updating display name:", error)
      throw error
    }
  } catch (error) {
    console.error("Error updating display name:", error)
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
    if (updates.displayName !== undefined && updates.displayName.length > 32) {
      throw new Error("Display name must be 32 characters or less")
    }
    
    const updateData: Record<string, unknown> = {}
    
    if (updates.displayName !== undefined) {
      updateData.display_name = updates.displayName.trim() || null
    }
    if (updates.emailConsent !== undefined) {
      updateData.email_consent = updates.emailConsent
    }
    if (updates.schoolName !== undefined) {
      updateData.school_name = updates.schoolName.trim() || null
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
    
    if (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

