import { logger } from '@/lib/logger'
import { seFetch, type SmartEmailingResult } from './client'
import { getSmartEmailingConfig, IMPORT_BATCH_SIZE, PAGE_SIZE } from './config'

/**
 * Newsletter contact operations against SmartEmailing.
 *
 * ⚠️ Server-only.
 *
 * Supabase (`public.newsletter_subscribers`) is the source of truth; these
 * functions push its state into the SmartEmailing contact list and read back
 * unsubscribes that happened through SmartEmailing's own footer link.
 */

export interface SubscriberSyncEntry {
  email: string
  /** true → member of the list as `confirmed`, false → `unsubscribed`. */
  subscribed: boolean
}

export interface PushOptions {
  /**
   * Tight time budget for calls made while a user waits for the response.
   * Failures are queued for the retry job instead of being retried inline.
   */
  interactive?: boolean
}

/**
 * Writes subscribers into the configured contact list via `POST /import`,
 * which handles both inserts and updates.
 *
 * Requests are split into batches of 500 (the API maximum). A failing batch
 * does not stop the others - the caller gets the list of e-mails that were
 * synced and the first error, so successful rows can still be marked done.
 *
 * We use single opt-in (no `double_opt_in_settings`) and
 * `preserve_unsubscribed: false`: because Supabase is the master, re-subscribing
 * in our app has to reactivate a contact that SmartEmailing still considers
 * unsubscribed.
 */
export async function pushSubscribers(
  entries: SubscriberSyncEntry[],
  options: PushOptions = {}
): Promise<{
  syncedEmails: string[]
  failedEmails: string[]
  error?: string
}> {
  if (entries.length === 0) {
    return { syncedEmails: [], failedEmails: [] }
  }

  const config = getSmartEmailingConfig()
  if (!config) {
    return {
      syncedEmails: [],
      failedEmails: entries.map((entry) => entry.email),
      error: 'SmartEmailing není nakonfigurován',
    }
  }

  const syncedEmails: string[] = []
  const failedEmails: string[] = []
  let firstError: string | undefined

  for (let start = 0; start < entries.length; start += IMPORT_BATCH_SIZE) {
    const batch = entries.slice(start, start + IMPORT_BATCH_SIZE)

    const result = await seFetch<unknown>('/import', {
      method: 'POST',
      ...(options.interactive ? { timeoutMs: 5_000, maxAttempts: 1 } : {}),
      body: {
        settings: {
          update: true,
          skip_invalid_emails: true,
          preserve_unsubscribed: false,
        },
        data: batch.map((entry) => ({
          emailaddress: entry.email,
          contactlists: [
            {
              id: config.contactListId,
              status: entry.subscribed ? 'confirmed' : 'unsubscribed',
            },
          ],
        })),
      },
    })

    if (result.ok) {
      syncedEmails.push(...batch.map((entry) => entry.email))
    } else {
      failedEmails.push(...batch.map((entry) => entry.email))
      firstError ??= result.error
      logger.error('SmartEmailing import batch failed', {
        error: result.error,
        status: result.status,
        count: batch.length,
      })
    }
  }

  return { syncedEmails, failedEmails, error: firstError }
}

interface ListContactResponse {
  emailaddress?: string
  /** 1 when the contact is blacklisted account-wide. */
  blacklisted?: number
  /** 1 after a permanent delivery failure - the address most likely is gone. */
  hardbounced?: number
  contactlists?: { contactlist_id?: number; status?: string }[]
}

/**
 * State of one contact as SmartEmailing sees it.
 *
 * Read-only for us: blacklisting and bounce handling are SmartEmailing's
 * decisions, we only mirror them so the admin list can explain why an address
 * is unreachable.
 */
export interface ContactState {
  email: string
  blacklisted: boolean
  hardbounced: boolean
  /** Membership in our list: confirmed / unsubscribed / removed, or null. */
  listStatus: string | null
  /** Blacklisted, or no longer a confirmed member - do not mail them. */
  optedOut: boolean
}

/**
 * Reads every contact of the configured list with its delivery state.
 *
 * The whole list is read rather than just `/contacts/unsubscribed`, which
 * omits hard-bounced contacts that are still `confirmed` - those are exactly
 * the addresses we want to surface as undeliverable.
 */
export async function fetchListContacts(): Promise<
  SmartEmailingResult<ContactState[]>
> {
  const config = getSmartEmailingConfig()
  if (!config) {
    return { ok: false, error: 'SmartEmailing není nakonfigurován' }
  }

  const contacts: ContactState[] = []
  let offset = 0

  // Bounded loop: the API caps a page at 500 records, and we stop as soon as a
  // page comes back short.
  for (;;) {
    const query = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
    })

    const result = await seFetch<ListContactResponse[]>(
      `/contactlists/${config.contactListId}/contacts?${query.toString()}`
    )
    if (!result.ok) {
      return result
    }

    const page = Array.isArray(result.data) ? result.data : []
    for (const contact of page) {
      const email = contact.emailaddress?.trim().toLowerCase()
      if (!email) continue

      const listStatus =
        (contact.contactlists ?? []).find(
          (membership) => membership.contactlist_id === config.contactListId
        )?.status ?? null
      const blacklisted = contact.blacklisted === 1

      contacts.push({
        email,
        blacklisted,
        hardbounced: contact.hardbounced === 1,
        listStatus,
        optedOut:
          blacklisted ||
          listStatus === 'unsubscribed' ||
          listStatus === 'removed',
      })
    }

    if (page.length < PAGE_SIZE) {
      return { ok: true, data: contacts }
    }
    offset += PAGE_SIZE
  }
}

/**
 * Verifies the configured credentials. Used by the admin diagnostics.
 */
export async function checkCredentials(): Promise<SmartEmailingResult<unknown>> {
  return seFetch<unknown>('/check-credentials')
}
