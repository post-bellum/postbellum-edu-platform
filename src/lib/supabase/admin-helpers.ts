'use server'

import { cache } from 'react'
import { createClient } from './server'
import { getUser } from './auth-helpers'
import { logger } from '@/lib/logger'

const getIsAdmin = cache(async (): Promise<boolean> => {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) return false
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    
    if (error) {
      logger.error('Error checking admin status:', error)
      return false
    }
    
    return profile?.is_admin === true
  } catch (error) {
    logger.error('Error checking admin status:', error)
    return false
  }
})

export async function isAdmin(): Promise<boolean> {
  return getIsAdmin()
}

/**
 * Require admin access - throws error if user is not admin
 * @throws Error if user is not admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Admin access required')
  }
}

