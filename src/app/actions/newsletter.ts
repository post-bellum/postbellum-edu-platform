'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { parseNewsletterEmail } from '@/lib/schemas/newsletter.schema'
import { syncSubscriberNow } from '@/lib/smartemailing/sync'

/**
 * Base URL for the unsubscribe links we hand out.
 *
 * Taken from the environment rather than the request `Host` header, which a
 * client controls - the same reasoning as in `exportNewsletterSubscribersCSV`.
 */
function getBaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!url) {
    logger.error('NEXT_PUBLIC_APP_URL environment variable is not set')
    return null
  }
  return url.replace(/\/+$/, '')
}

export async function subscribeToNewsletter(email: string) {
  try {
    // Validate and normalize (trim + lowercase) with the schema the signup
    // form uses, so client and server agree on what is accepted.
    const parsed = parseNewsletterEmail(email)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error,
      }
    }
    const trimmedEmail = parsed.email

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
          // Queue the SmartEmailing write before attempting it, so a crash
          // between the two leaves the row for the retry job.
          se_pending: true,
          updated_at: new Date().toISOString(),
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

    // Push to the SmartEmailing contact list. Best-effort: a failure only
    // leaves the row pending for the sync job, the user still succeeds.
    await syncSubscriberNow(trimmedEmail, true)

    const baseUrl = getBaseUrl()
    return {
      success: true,
      unsubscribeUrl: baseUrl && data?.unsubscribe_token
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
          se_pending: true,
          updated_at: new Date().toISOString(),
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
          se_pending: true,
          updated_at: new Date().toISOString(),
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

    // Mirror the change into the SmartEmailing contact list (best-effort)
    await syncSubscriberNow(email, subscribe)

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
        se_pending: true,
        updated_at: new Date().toISOString(),
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

    // Mirror the opt-out into SmartEmailing so no further campaign reaches them
    await syncSubscriberNow(data.email, false)

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
