'use server'

import { createClient } from '@/lib/supabase/server'
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

    const supabase = await createClient()
    
    // Try to insert the email and get the unsubscribe token
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: trimmedEmail })
      .select('unsubscribe_token')
      .single()

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        // Email already exists - fetch existing token
        const { data: existing } = await supabase
          .from('newsletter_subscribers')
          .select('unsubscribe_token')
          .eq('email', trimmedEmail)
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

    const supabase = await createClient()
    
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
