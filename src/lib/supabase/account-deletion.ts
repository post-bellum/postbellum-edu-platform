'use client'

import { deleteAccountAction } from '@/app/actions/delete-account'
import { logger } from '@/lib/logger'

/**
 * Delete user account (client-side wrapper)
 * Calls the server action which uses admin privileges to delete from auth.users
 * The ON DELETE CASCADE will automatically delete the profile
 * 
 * @throws Error if deletion fails
 */
export async function deleteUserAccount(): Promise<void> {
  try {
    const result = await deleteAccountAction()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete account')
    }
  } catch (error) {
    logger.error('Error deleting account', error)
    throw error
  }
}

/**
 * Check if account can be deleted
 * Future implementation: Add checks for:
 * - Active subscriptions
 * - Owned resources that need transfer
 * - Pending operations
 * 
 * Currently always returns true for logged-in users.
 * Uncomment and implement when needed.
 */
/*
export async function canDeleteAccount(): Promise<{ 
  canDelete: boolean
  reason?: string 
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { canDelete: false, reason: "Not logged in" }
    }

    // TODO: Add your business logic checks here
    // Example:
    // const { data: subscriptions } = await supabase
    //   .from('subscriptions')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .eq('status', 'active')
    // 
    // if (subscriptions && subscriptions.length > 0) {
    //   return { canDelete: false, reason: "Active subscription exists" }
    // }

    return { canDelete: true }
  } catch (error) {
    logger.error("Error checking if account can be deleted:", error)
    return { 
      canDelete: false, 
      reason: "Error checking account status" 
    }
  }
}
*/

