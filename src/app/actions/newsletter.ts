'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { headers } from 'next/headers'

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function getBaseUrl() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export async function subscribeToNewsletter(email: string) {
  try {
    // Validate email
    const trimmedEmail = email.trim().toLowerCase()
    
    if (!trimmedEmail) {
      return {
        success: false,
        error: 'Zadejte prosím e-mailovou adresu',
      }
    }
    
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return {
        success: false,
        error: 'Zadejte prosím platnou e-mailovou adresu',
      }
    }

    // Use admin client to bypass RLS - this is safe because:
    // 1. We validate email format above
    // 2. This is a server action (runs on server, not client)
    // 3. Avoids RLS warnings in Supabase for public INSERT
    const supabase = createAdminClient()
    
    // Try to insert the email and get the unsubscribe token
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: trimmedEmail })
      .select('unsubscribe_token')
      .single()

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        // Email already exists - reactivate subscription
        const { data: existing } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            is_active: true,
            unsubscribed_at: null,
          })
          .eq('email', trimmedEmail)
          .select('unsubscribe_token')
          .single()
        
        const baseUrl = await getBaseUrl()
        return {
          success: true,
          unsubscribeUrl: existing?.unsubscribe_token 
            ? `${baseUrl}/unsubscribe?token=${existing.unsubscribe_token}`
            : undefined,
        }
      }
      
      logger.error('Error subscribing to newsletter', error)
      return {
        success: false,
        error: 'Nepodařilo se přihlásit k odběru. Zkuste to prosím znovu.',
      }
    }

    const baseUrl = await getBaseUrl()
    return {
      success: true,
      unsubscribeUrl: data?.unsubscribe_token 
        ? `${baseUrl}/unsubscribe?token=${data.unsubscribe_token}`
        : undefined,
    }
  } catch (error) {
    logger.error('Error subscribing to newsletter', error)
    return {
      success: false,
      error: 'Nepodařilo se přihlásit k odběru. Zkuste to prosím znovu.',
    }
  }
}

export async function unsubscribeFromNewsletter(token: string) {
  try {
    if (!token) {
      return {
        success: false,
        error: 'Neplatný odkaz pro odhlášení',
      }
    }

    // Use admin client to bypass RLS - this is safe because:
    // 1. We validate by unique token (the "authentication")
    // 2. We only update specific fields
    // 3. User doesn't need to be logged in to unsubscribe via email link
    const supabase = createAdminClient()
    
    // Update subscription to inactive
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('unsubscribe_token', token)
      .select('email')
      .single()

    if (error || !data) {
      logger.error('Error unsubscribing from newsletter', error)
      return {
        success: false,
        error: 'Nepodařilo se odhlásit z odběru. Odkaz může být neplatný.',
      }
    }

    return {
      success: true,
      email: data.email,
    }
  } catch (error) {
    logger.error('Error unsubscribing from newsletter', error)
    return {
      success: false,
      error: 'Nepodařilo se odhlásit z odběru. Zkuste to prosím znovu.',
    }
  }
}
