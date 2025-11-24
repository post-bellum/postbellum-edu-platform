'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Delete user account (server action)
 * This uses admin privileges to delete from auth.users
 * which cascades to profiles table due to ON DELETE CASCADE
 */
export async function deleteAccountAction() {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
      return {
        success: false,
        error: 'Server configuration error: Missing Supabase URL'
      }
    }

    if (!serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY - required for account deletion')
      return {
        success: false,
        error: 'Server not configured for account deletion. Please contact administrator.'
      }
    }

    const cookieStore = await cookies()

    // Create admin client with service role key
    const supabaseAdmin = createServerClient(
      supabaseUrl,
      serviceRoleKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Get current user from the regular client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { 
        success: false, 
        error: 'No user logged in' 
      }
    }

    // Delete user using admin client
    // This will CASCADE delete the profile automatically
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    )

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return { 
        success: false, 
        error: deleteError.message 
      }
    }

    // Sign out the user
    await supabase.auth.signOut()

    return { success: true }
  } catch (error) {
    console.error('Error in deleteAccountAction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

