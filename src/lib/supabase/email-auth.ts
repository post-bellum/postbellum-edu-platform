'use client'

import { createClient } from './client'
import { logger } from '@/lib/logger'
import { qaSignUpAction, qaVerifyOTPAction } from '@/app/actions/qa-auth'

/**
 * QA Testing Configuration
 * Configure via environment variables:
 * - NEXT_PUBLIC_QA_EMAIL_PATTERN: Regex pattern for QA emails (e.g., "\\+qa" matches test+qa@example.com)
 * - NEXT_PUBLIC_QA_OTP_CODE: 6-digit OTP code that bypasses verification (e.g., "111111")
 * 
 * When both are set:
 * - QA emails are created with auto-confirmed email (no verification email sent)
 * - Use the QA OTP code to complete verification and get a valid session
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

/**
 * Check if email is a QA test email
 */
export function isQAEmail(email: string): boolean {
  const config = getQAConfig()
  if (!config) return false
  return config.emailPattern.test(email)
}

/**
 * Check if OTP code is the QA bypass code
 */
function isQAOTPCode(token: string): boolean {
  const config = getQAConfig()
  if (!config) return false
  return token === config.otpCode
}

/**
 * Sign up with email and password
 * Sends verification email automatically
 * 
 * For QA emails matching NEXT_PUBLIC_QA_EMAIL_PATTERN:
 * - User is created with auto-confirmed email (no verification email sent)
 * - Use NEXT_PUBLIC_QA_OTP_CODE to complete verification
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    // Try QA signup first via server action (server has reliable env var access)
    // The server action will return 'Not a QA email' if QA is not configured or email doesn't match
    const qaResult = await qaSignUpAction(email, password)
    
    if (qaResult.success) {
      // QA signup worked - user is created with confirmed email
      const qaConfig = getQAConfig()
      logger.info('QA email signup successful (no email sent)', { 
        email, 
        otpCode: qaConfig?.otpCode 
      })
      return { data: { user: null, session: null }, error: null, isQA: true }
    }
    
    // If server said "Not a QA email", proceed with regular signup
    // Any other error from QA signup should be thrown
    if (qaResult.error && !qaResult.error.includes('Not a QA email')) {
      throw new Error(qaResult.error)
    }
    
    // Regular signup - sends verification email
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    logger.error('Sign up error', error)
    return { data: null, error }
  }
}

/**
 * Sign in with email and password
 * Only works if email is verified
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    logger.error('Sign in error', error)
    return { data: null, error }
  }
}

/**
 * Verify OTP code
 * For QA emails, accepts the configured QA OTP code and creates a valid session
 */
export async function verifyOTP(email: string, token: string, _password?: string) {
  try {
    // Try QA verification first via server action (server has reliable env var access)
    // The server action validates both email pattern and OTP code
    const qaResult = await qaVerifyOTPAction(email, token)
    
    if (qaResult.success) {
      // QA verification worked
      logger.info('QA user verified with valid session', { email, hasSession: qaResult.session })
      return { data: { user: { id: qaResult.userId }, session: qaResult.session }, error: null, isQABypass: true }
    }
    
    // If server said "Invalid QA verification", proceed with regular OTP
    // Any other error should be thrown
    if (qaResult.error && !qaResult.error.includes('Invalid QA verification')) {
      throw new Error(qaResult.error)
    }
    
    // Regular OTP verification
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    logger.error('OTP verification error', error)
    return { data: null, error }
  }
}

/**
 * Resend OTP code
 * For QA emails, skips actual email sending
 */
export async function resendOTP(email: string) {
  try {
    // Skip resend for QA emails - they don't need the actual email
    const qaConfig = getQAConfig()
    if (qaConfig && isQAEmail(email)) {
      logger.info('QA email resend skipped', { email, otpCode: qaConfig.otpCode })
      return { data: { messageId: 'qa-bypass' }, error: null }
    }
    
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    logger.error('Resend OTP error', error)
    return { data: null, error }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    logger.error('Password reset email error', error)
    return { data: null, error }
  }
}

/**
 * Update password (used after reset link)
 */
export async function updatePassword(newPassword: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    logger.error('Update password error', error)
    return { data: null, error }
  }
}

/**
 * Get Supabase error message in Czech
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'Neznámá chyba'
  
  const message = (error && typeof error === 'object' && 'message' in error ? error.message as string : null) 
    || (error && typeof error === 'object' && 'error_description' in error ? (error as Record<string, unknown>).error_description as string : null) 
    || ''
  
  // Map common Supabase errors to Czech
  if (message.includes('Invalid login credentials')) {
    return 'Neplatné přihlašovací údaje'
  }
  if (message.includes('Email not confirmed')) {
    return 'Email nebyl ověřen. Zkontrolujte svou e-mailovou schránku.'
  }
  if (message.includes('User already registered')) {
    return 'Uživatel s tímto emailem již existuje'
  }
  if (message.includes('Password should be at least')) {
    return 'Heslo musí mít alespoň 6 znaků'
  }
  if (message.includes('Unable to validate email')) {
    return 'Neplatný formát emailu'
  }
  if (message.includes('Email rate limit exceeded')) {
    return 'Bylo odesláno příliš mnoho emailů. Zkuste to později.'
  }
  if (message.includes('Token has expired')) {
    return 'Platnost odkazu vypršela. Požádejte o nový.'
  }
  if (message.includes('New password should be different from the old password')) {
    return 'Nové heslo se musí lišit od původního hesla'
  }
  if (message.includes('Auth session missing')) {
    return 'Platnost odkazu vypršela. Požádejte o nový odkaz pro obnovení hesla.'
  }
  
  return message || 'Neznámá chyba'
}


