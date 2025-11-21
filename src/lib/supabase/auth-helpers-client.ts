"use client"

import { createClient } from "./client"
import type { User } from "@supabase/supabase-js"

/**
 * Get the current logged-in user (client-side)
 * Returns null if not logged in
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error("Error fetching user:", error.message)
      return null
    }
    
    return user
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}

/**
 * Get the current session (client-side)
 * Returns null if not logged in
 */
export async function getCurrentSession() {
  try {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("Error fetching session:", error.message)
      return null
    }
    
    return session
  } catch (error) {
    console.error("Error in getCurrentSession:", error)
    return null
  }
}

/**
 * Check if user is currently logged in (client-side)
 */
export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Sign out the current user (client-side)
 */
export async function logout() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error("Error signing out:", error.message)
      throw new Error("Failed to sign out")
    }
    
    // Redirect to home page after logout
    window.location.href = "/"
  } catch (error) {
    console.error("Error in logout:", error)
    throw error
  }
}

