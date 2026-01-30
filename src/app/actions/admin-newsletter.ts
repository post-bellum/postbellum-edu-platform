'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/admin-helpers'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/database.types'

// Use generated database types for type safety
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']

export interface NewsletterStats {
  total: number
  active: number
  unsubscribed: number
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
