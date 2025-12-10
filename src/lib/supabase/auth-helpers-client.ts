'use client'

import { createClient } from './client'
import type { User } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/**
 * Get the current logged-in user (client-side)
 * Returns null if not logged in
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      logger.error('Error fetching user', error)
      return null
    }
    
    return user
  } catch (error) {
    logger.error('Error in getCurrentUser', error)
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
      logger.error('Error fetching session', error)
      return null
    }
    
    return session
  } catch (error) {
    logger.error('Error in getCurrentSession', error)
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
      logger.error('Error signing out', error)
      throw new Error('Failed to sign out')
    }
    
    // Redirect to home page after logout
    window.location.href = '/'
  } catch (error) {
    logger.error('Error in logout', error)
    throw error
  }
}

