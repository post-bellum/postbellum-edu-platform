'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    
    // Try to insert the email
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: trimmedEmail })

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        // Email already exists - still return success to not reveal existing subscriptions
        return {
          success: true,
        }
      }
      
      logger.error('Error subscribing to newsletter', error)
      return {
        success: false,
        error: 'Nepodařilo se přihlásit k odběru. Zkuste to prosím znovu.',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    logger.error('Error subscribing to newsletter', error)
    return {
      success: false,
      error: 'Nepodařilo se přihlásit k odběru. Zkuste to prosím znovu.',
    }
  }
}
