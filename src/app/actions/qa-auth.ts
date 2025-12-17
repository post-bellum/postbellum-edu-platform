'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/database.types'

/**
 * QA Testing Configuration
 * These env vars control QA email bypass:
 * - NEXT_PUBLIC_QA_EMAIL_PATTERN: Regex pattern for QA emails
 * - NEXT_PUBLIC_QA_OTP_CODE: OTP code that bypasses verification
 */
function getQAConfig() {
  const pattern = process.env.NEXT_PUBLIC_QA_EMAIL_PATTERN
  const code = process.env.NEXT_PUBLIC_QA_OTP_CODE
  
  if (!pattern || !code) {
    return null
  }
  
  try {
    return {
      emailPattern: new RegExp(pattern, 'i'),
      otpCode: code,
    }
  } catch {
    logger.error('Invalid QA email pattern regex', { pattern })
    return null
  }
}

function isQAEmail(email: string): boolean {
  const config = getQAConfig()
  if (!config) return false
  return config.emailPattern.test(email)
}

function isQAOTPCode(token: string): boolean {
  const config = getQAConfig()
  if (!config) return false
  return token === config.otpCode
}

/**
 * QA Sign Up - Creates a user with auto-confirmed email
 * No verification email is sent
 */
export async function qaSignUpAction(email: string, password: string) {
  try {
    // Validate this is a QA email
    if (!isQAEmail(email)) {
      return {
        success: false,
        error: 'Not a QA email - use regular signup',
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      logger.error('Missing Supabase admin credentials for QA signup')
      return {
        success: false,
        error: 'Server not configured for QA signup',
      }
    }

    // Create admin client
    const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create user with email confirmed using admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email - no verification email sent
    })

    if (createError) {
      // Check if user already exists
      if (createError.message.includes('already been registered')) {
        logger.info('QA user already exists, proceeding', { email })
        return { success: true, userExists: true }
      }
      
      logger.error('QA signup error', createError)
      return {
        success: false,
        error: createError.message,
      }
    }

    logger.info('QA user created with confirmed email', { 
      email, 
      userId: userData.user?.id 
    })

    return { success: true, userId: userData.user?.id }
  } catch (error) {
    logger.error('QA signup action error', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * QA Verify OTP - Signs in the QA user (email already confirmed)
 * Sets proper session cookies
 */
export async function qaVerifyOTPAction(email: string, token: string) {
  try {
    // Validate this is a QA email with correct OTP
    if (!isQAEmail(email) || !isQAOTPCode(token)) {
      return {
        success: false,
        error: 'Invalid QA verification',
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      logger.error('Missing Supabase credentials for QA verification')
      return {
        success: false,
        error: 'Server not configured for QA verification',
      }
    }

    const cookieStore = await cookies()

    // Create admin client to generate magic link token
    const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Generate a magic link for the user (this creates a valid session)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (linkError || !linkData) {
      logger.error('QA magic link generation error', linkError)
      return {
        success: false,
        error: linkError?.message || 'Failed to generate session',
      }
    }

    // Extract the token from the link and verify it to create a session
    const tokenHash = linkData.properties?.hashed_token
    
    if (!tokenHash) {
      logger.error('QA magic link missing token hash')
      return {
        success: false,
        error: 'Failed to generate session token',
      }
    }

    // Create server client with cookie handling
    const supabase = createServerClient<Database>(
      supabaseUrl,
      anonKey,
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
              // Ignore - called from Server Component
            }
          },
        },
      }
    )

    // Verify the OTP to create a session
    const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'magiclink',
    })

    if (verifyError) {
      logger.error('QA session verification error', verifyError)
      return {
        success: false,
        error: verifyError.message,
      }
    }

    logger.info('QA user verified and signed in', { 
      email, 
      userId: sessionData.user?.id 
    })

    return { 
      success: true, 
      userId: sessionData.user?.id,
      session: sessionData.session ? true : false,
    }
  } catch (error) {
    logger.error('QA verify OTP action error', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
