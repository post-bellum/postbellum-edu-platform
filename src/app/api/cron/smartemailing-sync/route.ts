import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { logger } from '@/lib/logger'
import { pushPendingSubscribers, reconcileUnsubscribes } from '@/lib/smartemailing/sync'

/**
 * GET /api/cron/smartemailing-sync?mode=push|reconcile|all
 *
 * Keeps the SmartEmailing contact list in step with `newsletter_subscribers`:
 *  - `push` (hourly): retries every subscriber whose write-through failed.
 *  - `full`: pushes every subscriber, repairing drift caused by edits made
 *    directly in SmartEmailing (e.g. contacts deleted there).
 *  - `reconcile` (nightly): applies unsubscribes made through SmartEmailing's
 *    own unsubscribe link, which never reach our `/unsubscribe` page.
 *  - `all` (default): both. Reconcile runs first, so a full push cannot
 *    briefly re-confirm somebody who had opted out in SmartEmailing.
 *
 * Authorized either by the Vercel Cron secret (`Authorization: Bearer …`) or
 * by an admin session, so it can also be triggered from the admin UI.
 */

// Sync talks to an external API and the database - never cache the response.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type SyncMode = 'push' | 'reconcile' | 'full' | 'all'

function parseMode(value: string | null): SyncMode {
  return value === 'push' || value === 'reconcile' || value === 'full'
    ? value
    : 'all'
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET?.trim()
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) {
    return true
  }
  return isAdmin()
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const mode = parseMode(request.nextUrl.searchParams.get('mode'))

  try {
    // Reconcile first: it can queue rows that the push then writes back.
    const reconcile =
      mode === 'push'
        ? { reconciled: 0, stateUpdated: 0, requeued: 0, error: undefined }
        : await reconcileUnsubscribes()

    const push =
      mode === 'reconcile'
        ? { pushed: 0, failed: 0 }
        : await pushPendingSubscribers({ all: mode === 'full' })

    const result = {
      mode,
      pushed: push.pushed,
      failed: push.failed,
      reconciled: reconcile.reconciled,
      stateUpdated: reconcile.stateUpdated,
      requeued: reconcile.requeued,
      // Surfaced rather than thrown: a partial run is still worth reporting.
      errors: [push.error, reconcile.error].filter(Boolean) as string[],
    }

    logger.info('SmartEmailing sync finished', result)
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Error running SmartEmailing sync', error)
    return NextResponse.json(
      { error: 'SmartEmailing sync failed' },
      { status: 500 }
    )
  }
}
