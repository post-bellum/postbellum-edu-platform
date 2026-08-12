'use server'

import { createAdminClient } from '@/lib/supabase/admin'
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

    // Use admin client to bypass RLS - this is safe because:
    // 1. We validate email format above
    // 2. This is a server action (runs on server, not client)
    // 3. Avoids RLS warnings in Supabase for public INSERT
    const supabase = createAdminClient()
    
    // Use upsert for atomic operation - avoids race condition
    // If email exists: reactivate subscription
    // If email doesn't exist: create new subscription
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { 
          email: trimmedEmail,
          is_active: true,
          unsubscribed_at: null,
        },
        { 
          onConflict: 'email',
          ignoreDuplicates: false,
        }
      )
      .select('unsubscribe_token')
      .single()

    if (error) {
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

/**
 * Get the newsletter subscription status for the currently logged-in user.
 * The email is derived server-side from the session (never trusted from the client).
 */
export async function getMyNewsletterStatus(): Promise<{
  success: boolean
  isSubscribed: boolean
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return { success: false, isSubscribed: false }
    }

    // Read from newsletter_subscribers (the authoritative mailing list).
    // Admin client bypasses RLS; we only look up the authenticated user's own email.
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('newsletter_subscribers')
      .select('is_active')
      .eq('email', user.email.trim().toLowerCase())
      .maybeSingle()

    if (error) {
      logger.error('Error fetching newsletter status', error)
      return { success: false, isSubscribed: false }
    }

    return { success: true, isSubscribed: !!data?.is_active }
  } catch (error) {
    logger.error('Error fetching newsletter status', error)
    return { success: false, isSubscribed: false }
  }
}

/**
 * Subscribe or unsubscribe the currently logged-in user from the newsletter.
 * Keeps newsletter_subscribers and profiles.email_consent in sync.
 * The email/user are derived server-side from the session.
 */
export async function setMyNewsletterSubscription(subscribe: boolean): Promise<{
  success: boolean
  isSubscribed: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return {
        success: false,
        isSubscribed: false,
        error: 'Pro změnu odběru musíte být přihlášeni.',
      }
    }

    const email = user.email.trim().toLowerCase()
    const admin = createAdminClient()

    // Update the mailing list
    if (subscribe) {
      const { error } = await admin.from('newsletter_subscribers').upsert(
        {
          email,
          is_active: true,
          unsubscribed_at: null,
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false,
        }
      )

      if (error) {
        logger.error('Error subscribing user to newsletter', error)
        return {
          success: false,
          isSubscribed: false,
          error: 'Nepodařilo se přihlásit k odběru. Zkuste to prosím znovu.',
        }
      }
    } else {
      const { error } = await admin
        .from('newsletter_subscribers')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('email', email)

      if (error) {
        logger.error('Error unsubscribing user from newsletter', error)
        return {
          success: false,
          isSubscribed: true,
          error: 'Nepodařilo se odhlásit z odběru. Zkuste to prosím znovu.',
        }
      }
    }

    // Keep the per-user consent flag in sync so the two sources don't drift
    const { error: profileError } = await admin
      .from('profiles')
      .update({ email_consent: subscribe })
      .eq('id', user.id)

    if (profileError) {
      // The mailing list is already updated; log but don't fail the whole operation.
      logger.error('Error syncing email_consent with newsletter status', profileError)
    }

    return { success: true, isSubscribed: subscribe }
  } catch (error) {
    logger.error('Error updating newsletter subscription', error)
    return {
      success: false,
      isSubscribed: !subscribe,
      error: 'Nepodařilo se změnit odběr. Zkuste to prosím znovu.',
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
