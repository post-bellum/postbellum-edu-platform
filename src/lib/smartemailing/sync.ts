import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { fetchListContacts, pushSubscribers, type ContactState } from './contacts'
import { isSmartEmailingConfigured, IMPORT_BATCH_SIZE } from './config'

/**
 * Keeps `public.newsletter_subscribers` (the source of truth) and the
 * SmartEmailing contact list in step.
 *
 * ⚠️ Server-only - uses the Supabase service role client.
 *
 * Two directions:
 *  - push: every row flagged `se_pending` is written to SmartEmailing. Server
 *    actions call `syncSubscriberNow` right after their own write; whatever
 *    fails stays queued for the hourly cron.
 *  - reconcile: the SmartEmailing-side state of every contact (list status,
 *    blacklist, hard bounce) is read back, mirrored onto the row and - for
 *    opt-outs - applied to `is_active`.
 */

/** Rows pulled per push run - well within the 4 req/s account rate limit. */
const MAX_ROWS_PER_RUN = 20_000

/** PostgREST caps a single response, so rows are read page by page. */
const DB_PAGE_SIZE = 1_000

/**
 * Pushes one subscriber immediately and clears (or records) its sync flags.
 *
 * Best-effort by design: the caller has already committed the change in
 * Supabase, so a SmartEmailing outage must not turn into an error for the
 * user. Never throws.
 */
export async function syncSubscriberNow(
  email: string,
  subscribed: boolean
): Promise<void> {
  if (!isSmartEmailingConfigured()) {
    // Nothing to do - the row stays pending and the cron picks it up once
    // credentials are configured.
    return
  }

  try {
    // `interactive`: one attempt with a 5s budget. Anything slower is left to
    // the retry job rather than making the user wait for it.
    const { failedEmails, error } = await pushSubscribers([{ email, subscribed }], {
      interactive: true,
    })
    const admin = createAdminClient()

    if (failedEmails.length > 0) {
      await admin
        .from('newsletter_subscribers')
        .update({
          se_pending: true,
          se_sync_error: error ?? 'SmartEmailing sync failed',
          updated_at: new Date().toISOString(),
        })
        .eq('email', email)
      return
    }

    await admin
      .from('newsletter_subscribers')
      .update({
        se_pending: false,
        se_sync_error: null,
        se_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
  } catch (err) {
    logger.error('Error syncing subscriber to SmartEmailing', err)
  }
}

export interface PushResult {
  pushed: number
  failed: number
  error?: string
}

export interface PushOptions {
  /**
   * Push every subscriber, not just the queued ones.
   *
   * The incremental push only knows about changes made in our app. If contacts
   * are deleted or edited directly in SmartEmailing, nothing here is flagged as
   * pending and the drift would never be repaired - a full push rewrites the
   * whole list and restores them.
   */
  all?: boolean
}

/**
 * Reads the subscribers to push, paging around the PostgREST response cap.
 */
async function loadSubscribersToPush(
  admin: ReturnType<typeof createAdminClient>,
  all: boolean
): Promise<{ rows: { email: string; is_active: boolean | null }[]; error?: string }> {
  const rows: { email: string; is_active: boolean | null }[] = []

  for (let offset = 0; offset < MAX_ROWS_PER_RUN; offset += DB_PAGE_SIZE) {
    let query = admin
      .from('newsletter_subscribers')
      .select('email, is_active')
      .order('subscribed_at', { ascending: true })
      .range(offset, offset + DB_PAGE_SIZE - 1)

    if (!all) {
      query = query.eq('se_pending', true)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error loading newsletter subscribers to sync', error)
      return { rows, error: 'Nepodařilo se načíst odběratele k synchronizaci' }
    }

    const page = data ?? []
    rows.push(...page)

    if (page.length < DB_PAGE_SIZE) break
  }

  return { rows }
}

/**
 * Pushes subscribers into SmartEmailing: by default only those flagged
 * `se_pending`, or every one of them with `{ all: true }`.
 */
export async function pushPendingSubscribers(
  options: PushOptions = {}
): Promise<PushResult> {
  if (!isSmartEmailingConfigured()) {
    return { pushed: 0, failed: 0, error: 'SmartEmailing není nakonfigurován' }
  }

  const admin = createAdminClient()
  const { rows: pending, error: loadError } = await loadSubscribersToPush(
    admin,
    options.all === true
  )

  if (loadError) {
    return { pushed: 0, failed: 0, error: loadError }
  }

  if (pending.length === 0) {
    return { pushed: 0, failed: 0 }
  }

  const {
    syncedEmails,
    failedEmails,
    error: pushError,
  } = await pushSubscribers(
    pending.map((row) => ({ email: row.email, subscribed: !!row.is_active }))
  )

  const now = new Date().toISOString()

  // Mark the successful ones in chunks so the `in` filter stays a sane size.
  for (let start = 0; start < syncedEmails.length; start += IMPORT_BATCH_SIZE) {
    const chunk = syncedEmails.slice(start, start + IMPORT_BATCH_SIZE)
    const { error: updateError } = await admin
      .from('newsletter_subscribers')
      .update({
        se_pending: false,
        se_sync_error: null,
        se_synced_at: now,
        updated_at: now,
      })
      .in('email', chunk)

    if (updateError) {
      logger.error('Error clearing SmartEmailing sync flags', updateError)
    }
  }

  if (failedEmails.length > 0) {
    for (let start = 0; start < failedEmails.length; start += IMPORT_BATCH_SIZE) {
      const chunk = failedEmails.slice(start, start + IMPORT_BATCH_SIZE)
      const { error: updateError } = await admin
        .from('newsletter_subscribers')
        .update({
          se_sync_error: pushError ?? 'SmartEmailing sync failed',
          updated_at: now,
        })
        .in('email', chunk)

      if (updateError) {
        logger.error('Error recording SmartEmailing sync errors', updateError)
      }
    }
  }

  return {
    pushed: syncedEmails.length,
    failed: failedEmails.length,
    error: pushError,
  }
}

export interface ReconcileResult {
  /** Rows deactivated because they opted out in SmartEmailing. */
  reconciled: number
  /** Rows whose mirrored SmartEmailing state was refreshed. */
  stateUpdated: number
  /** Active subscribers missing from the list - re-queued for the next push. */
  requeued: number
  error?: string
}

/** Groups e-mails by the state they should be written with. */
function groupByState(contacts: ContactState[]): Map<string, ContactState[]> {
  const groups = new Map<string, ContactState[]>()
  for (const contact of contacts) {
    const key = `${contact.blacklisted}|${contact.hardbounced}|${contact.listStatus ?? ''}`
    const group = groups.get(key)
    if (group) {
      group.push(contact)
    } else {
      groups.set(key, [contact])
    }
  }
  return groups
}

/**
 * Mirrors the SmartEmailing-side state back onto our rows.
 *
 * Three things come back:
 *  - opt-outs (unsubscribed in SmartEmailing, or blacklisted) deactivate the
 *    subscriber here, since SmartEmailing adds its own unsubscribe link to
 *    every newsletter and those clicks never reach our `/unsubscribe` page;
 *  - blacklist / hard bounce / list status are stored so the admin list can
 *    show why an address is unreachable. `is_active` is deliberately left
 *    alone for a hard bounce: that is a delivery failure, not a withdrawn
 *    consent, and the address may start working again;
 *  - an active subscriber missing from the list entirely (deleted directly in
 *    SmartEmailing) is re-queued so the next push restores it.
 */
export async function reconcileUnsubscribes(): Promise<ReconcileResult> {
  const empty = { reconciled: 0, stateUpdated: 0, requeued: 0 }

  if (!isSmartEmailingConfigured()) {
    return { ...empty, error: 'SmartEmailing není nakonfigurován' }
  }

  const result = await fetchListContacts()
  if (!result.ok) {
    logger.error('Error fetching contacts from SmartEmailing', result.error)
    return { ...empty, error: result.error }
  }

  const contacts = result.data
  const admin = createAdminClient()
  const now = new Date().toISOString()

  let reconciled = 0
  let stateUpdated = 0

  // Mirror the state. One update per distinct state combination keeps this to
  // a handful of queries no matter how large the list grows.
  for (const group of groupByState(contacts).values()) {
    const state = group[0]
    for (let start = 0; start < group.length; start += IMPORT_BATCH_SIZE) {
      const chunk = group.slice(start, start + IMPORT_BATCH_SIZE)
      const { data: updated, error } = await admin
        .from('newsletter_subscribers')
        .update({
          se_blacklisted: state.blacklisted,
          se_hardbounced: state.hardbounced,
          se_list_status: state.listStatus,
          se_state_checked_at: now,
        })
        .in(
          'email',
          chunk.map((contact) => contact.email)
        )
        .select('email')

      if (error) {
        logger.error('Error mirroring SmartEmailing contact state', error)
        return { reconciled, stateUpdated, requeued: 0, error: 'Nepodařilo se uložit stav kontaktů ze SmartEmailing' }
      }

      stateUpdated += updated?.length ?? 0
    }
  }

  // Apply the opt-outs.
  const optedOut = contacts.filter((contact) => contact.optedOut).map((c) => c.email)
  for (let start = 0; start < optedOut.length; start += IMPORT_BATCH_SIZE) {
    const chunk = optedOut.slice(start, start + IMPORT_BATCH_SIZE)
    // `select` returns only the rows that actually changed, so re-running the
    // reconciliation over an unchanged list counts zero.
    const { data: updated, error } = await admin
      .from('newsletter_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: now,
        // Stay queued: the next push writes `unsubscribed` back to
        // SmartEmailing. Without it a still-pending row would later be pushed
        // as `confirmed` (we send `preserve_unsubscribed: false`) and resurrect
        // a contact who had opted out there.
        se_pending: true,
        updated_at: now,
      })
      .in('email', chunk)
      .eq('is_active', true)
      .select('email')

    if (error) {
      logger.error('Error applying SmartEmailing unsubscribes', error)
      return { reconciled, stateUpdated, requeued: 0, error: 'Nepodařilo se zapsat odhlášení ze SmartEmailing' }
    }

    reconciled += updated?.length ?? 0
  }

  const requeued = await requeueMissingSubscribers(admin, contacts, now)

  return { reconciled, stateUpdated, requeued }
}

/**
 * Re-queues active subscribers that the contact list does not contain at all -
 * typically because somebody deleted them directly in SmartEmailing.
 */
async function requeueMissingSubscribers(
  admin: ReturnType<typeof createAdminClient>,
  contacts: ContactState[],
  now: string
): Promise<number> {
  const known = new Set(contacts.map((contact) => contact.email))

  const { data, error } = await admin
    .from('newsletter_subscribers')
    .select('email')
    .eq('is_active', true)
    .eq('se_pending', false)
    .limit(MAX_ROWS_PER_RUN)

  if (error) {
    logger.error('Error looking for subscribers missing in SmartEmailing', error)
    return 0
  }

  const missing = (data ?? [])
    .map((row) => row.email)
    .filter((email) => !known.has(email))

  if (missing.length === 0) return 0

  let requeued = 0
  for (let start = 0; start < missing.length; start += IMPORT_BATCH_SIZE) {
    const chunk = missing.slice(start, start + IMPORT_BATCH_SIZE)
    const { data: updated, error: updateError } = await admin
      .from('newsletter_subscribers')
      .update({
        se_pending: true,
        se_list_status: null,
        se_state_checked_at: now,
        updated_at: now,
      })
      .in('email', chunk)
      .select('email')

    if (updateError) {
      logger.error('Error re-queueing subscribers missing in SmartEmailing', updateError)
      return requeued
    }

    requeued += updated?.length ?? 0
  }

  return requeued
}
