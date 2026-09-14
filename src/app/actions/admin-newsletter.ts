'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/admin-helpers'
import { logger } from '@/lib/logger'
import { pushPendingSubscribers, reconcileUnsubscribes } from '@/lib/smartemailing/sync'
import { isSmartEmailingConfigured } from '@/lib/smartemailing/config'
import type { Database } from '@/types/database.types'

// Use generated database types for type safety
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']

export interface NewsletterStats {
  total: number
  active: number
  unsubscribed: number
  /** Subscribers not yet written to the SmartEmailing contact list. */
  pendingSync: number
  /** Addresses SmartEmailing cannot deliver to (hard bounce or blacklist). */
  undeliverable: number
}

export async function getNewsletterSubscribers(): Promise<{
  success: boolean
  data?: NewsletterSubscriber[]
  stats?: NewsletterStats
  error?: string
}> {
  try {
    await requireAdmin()
    
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })

    if (error) {
      logger.error('Error fetching newsletter subscribers', error)
      return {
        success: false,
        error: 'Nepodařilo se načíst odběratele',
      }
    }

    const subscribers = data || []
    const stats: NewsletterStats = {
      total: subscribers.length,
      active: subscribers.filter(s => s.is_active).length,
      unsubscribed: subscribers.filter(s => !s.is_active).length,
      pendingSync: subscribers.filter(s => s.se_pending).length,
      undeliverable: subscribers.filter(s => s.se_hardbounced || s.se_blacklisted).length,
    }

    return {
      success: true,
      data: subscribers,
      stats,
    }
  } catch (error) {
    logger.error('Error fetching newsletter subscribers', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při načítání odběratelů',
    }
  }
}

export interface SmartEmailingSyncSummary {
  pushed: number
  failed: number
  reconciled: number
  requeued: number
}

/**
 * Runs the SmartEmailing synchronization on demand from the admin UI: pulls
 * back unsubscribes made in SmartEmailing, then pushes what is queued.
 * The hourly/nightly cron does the same thing unattended.
 *
 * With `full: true` every subscriber is pushed, not just the queued ones - use
 * it after contacts were deleted or changed directly in SmartEmailing, which
 * our queue knows nothing about.
 */
export async function syncNewsletterToSmartEmailing(options?: {
  full?: boolean
}): Promise<{
  success: boolean
  summary?: SmartEmailingSyncSummary
  error?: string
}> {
  try {
    await requireAdmin()

    if (!isSmartEmailingConfigured()) {
      return {
        success: false,
        error: 'SmartEmailing není nakonfigurován (chybí SMARTEMAILING_* proměnné).',
      }
    }

    // Reconcile first: it queues the opt-outs that the push then writes back,
    // so a full push cannot re-confirm somebody who opted out there.
    const reconcile = await reconcileUnsubscribes()
    const push = await pushPendingSubscribers({ all: options?.full === true })

    const summary: SmartEmailingSyncSummary = {
      pushed: push.pushed,
      failed: push.failed,
      reconciled: reconcile.reconciled,
      requeued: reconcile.requeued,
    }

    const firstError = push.error ?? reconcile.error
    if (firstError) {
      // Partial success is still worth reporting - the counts show what got
      // through before the API refused.
      return {
        success: false,
        summary,
        error: `Synchronizace skončila s chybou: ${firstError}`,
      }
    }

    return { success: true, summary }
  } catch (error) {
    logger.error('Error syncing newsletter to SmartEmailing', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při synchronizaci',
    }
  }
}

export async function exportNewsletterSubscribersCSV(): Promise<{
  success: boolean
  csv?: string
  error?: string
}> {
  try {
    await requireAdmin()
    
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, unsubscribe_token, subscribed_at, is_active')
      .eq('is_active', true)
      .order('subscribed_at', { ascending: false })

    if (error) {
      logger.error('Error exporting newsletter subscribers', error)
      return {
        success: false,
        error: 'Nepodařilo se exportovat odběratele',
      }
    }

    // Generate CSV with unsubscribe URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) {
      logger.error('NEXT_PUBLIC_APP_URL environment variable is not set')
      return {
        success: false,
        error: 'Chybí konfigurace aplikace (APP_URL)',
      }
    }
    const rows = (data || []).map(s => ({
      email: s.email,
      unsubscribe_url: `${baseUrl}/unsubscribe?token=${s.unsubscribe_token}`,
      subscribed_at: s.subscribed_at || '',
    }))

    const headers = ['email', 'unsubscribe_url', 'subscribed_at']
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(h => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n')

    return {
      success: true,
      csv: csvContent,
    }
  } catch (error) {
    logger.error('Error exporting newsletter subscribers', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při exportu',
    }
  }
}
