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
    
    // Save to profiles table (single source of truth)
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
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

