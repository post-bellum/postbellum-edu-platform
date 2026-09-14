import { logger } from '@/lib/logger'

/**
 * SmartEmailing API v3 configuration.
 *
 * ⚠️ Server-only. Reads SMARTEMAILING_* from the environment.
 *
 * The integration is optional: without credentials every call is skipped and
 * reported as a normal failure, so local development and preview deployments
 * keep working with Supabase alone.
 */

export const SMARTEMAILING_BASE_URL = 'https://app.smartemailing.cz/api/v3'

/** Maximum contacts the /import endpoint accepts in a single request. */
export const IMPORT_BATCH_SIZE = 500

/** Maximum records any collection endpoint returns per page. */
export const PAGE_SIZE = 500

export interface SmartEmailingConfig {
  /** Account e-mail, used as the HTTP Basic username. */
  user: string
  /** API key from Account Settings → API keys, used as the Basic password. */
  apiKey: string
  /** Contact list the newsletter subscribers belong to. */
  contactListId: number
}

/**
 * Reads and validates the configuration.
 *
 * Returns `null` (and logs once at warn level) when the integration is not
 * configured - callers treat that as "skip the sync", never as an error the
 * user should see.
 */
export function getSmartEmailingConfig(): SmartEmailingConfig | null {
  const user = process.env.SMARTEMAILING_API_USER?.trim()
  const apiKey = process.env.SMARTEMAILING_API_KEY?.trim()
  const rawListId = process.env.SMARTEMAILING_CONTACTLIST_ID?.trim()

  const missing = [
    !user && 'SMARTEMAILING_API_USER',
    !apiKey && 'SMARTEMAILING_API_KEY',
    !rawListId && 'SMARTEMAILING_CONTACTLIST_ID',
  ].filter(Boolean)

  if (missing.length > 0) {
    logger.warn('SmartEmailing not configured', { missing: missing.join(', ') })
    return null
  }

  const contactListId = Number(rawListId)
  if (!Number.isInteger(contactListId) || contactListId <= 0) {
    logger.warn('SmartEmailing not configured', {
      error: `SMARTEMAILING_CONTACTLIST_ID must be a positive integer, got "${rawListId}"`,
    })
    return null
  }

  return { user: user!, apiKey: apiKey!, contactListId }
}

export function isSmartEmailingConfigured(): boolean {
  return getSmartEmailingConfig() !== null
}
