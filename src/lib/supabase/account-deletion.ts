"use client"

import { deleteAccountAction } from "@/app/actions/delete-account"
import { createClient } from "./client"

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
      throw new Error(result.error || "Failed to delete account")
    }
  } catch (error) {
    console.error("Error deleting account:", error)
    throw error
  }
}

/**
 * Check if account can be deleted
 * You might want to add conditions here, such as:
 * - User must not have active subscriptions
 * - User must not be the owner of certain resources
 * - etc.
 */
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

    // Add any additional checks here
    // For example:
    // - Check if user has active subscriptions
    // - Check if user owns any resources that need to be transferred
    // - etc.

    return { canDelete: true }
  } catch (error) {
    console.error("Error checking if account can be deleted:", error)
    return { 
      canDelete: false, 
      reason: "Error checking account status" 
    }
  }
}

