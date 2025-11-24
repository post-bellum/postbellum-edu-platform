"use client"

import { createClient } from "./client"

/**
 * Sign up with email and password
 * Sends verification email automatically
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
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
    console.error("Sign up error:", error)
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
    console.error("Sign in error:", error)
    return { data: null, error }
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(email: string, token: string) {
  try {
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
    console.error("OTP verification error:", error)
    return { data: null, error }
  }
}

/**
 * Resend OTP code
 */
export async function resendOTP(email: string) {
  try {
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
    console.error("Resend OTP error:", error)
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
    console.error("Password reset email error:", error)
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
    console.error("Update password error:", error)
    return { data: null, error }
  }
}

/**
 * Get Supabase error message in Czech
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "Neznámá chyba"
  
  const message = (error && typeof error === 'object' && 'message' in error ? error.message as string : null) 
    || (error && typeof error === 'object' && 'error_description' in error ? (error as Record<string, unknown>).error_description as string : null) 
    || ""
  
  // Map common Supabase errors to Czech
  if (message.includes("Invalid login credentials")) {
    return "Neplatné přihlašovací údaje"
  }
  if (message.includes("Email not confirmed")) {
    return "Email nebyl ověřen. Zkontrolujte svou e-mailovou schránku."
  }
  if (message.includes("User already registered")) {
    return "Uživatel s tímto emailem již existuje"
  }
  if (message.includes("Password should be at least")) {
    return "Heslo musí mít alespoň 6 znaků"
  }
  if (message.includes("Unable to validate email")) {
    return "Neplatný formát emailu"
  }
  if (message.includes("Email rate limit exceeded")) {
    return "Bylo odesláno příliš mnoho emailů. Zkuste to později."
  }
  if (message.includes("Token has expired")) {
    return "Platnost odkazu vypršela. Požádejte o nový."
  }
  
  return message || "Neznámá chyba"
}


