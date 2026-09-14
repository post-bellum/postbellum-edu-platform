import { logger } from '@/lib/logger'
import {
  getSmartEmailingConfig,
  SMARTEMAILING_BASE_URL,
  type SmartEmailingConfig,
} from './config'

/**
 * Low-level HTTP client for the SmartEmailing API v3.
 *
 * ⚠️ Server-only.
 *
 * Follows the same contract as `sendAdminEmail` in `@/lib/email/resend`: it
 * never throws. A missing configuration, a network failure or an API error all
 * come back as `{ ok: false, error }` so the caller can record the failure and
 * still succeed for the user.
 *
 * Rate limits (per account): burst 2 500 requests, sustained 4 req/s, 100 000
 * requests/day. Exceeding them yields 429 with a `Retry-After` header, which is
 * respected below.
 */

export type SmartEmailingResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number }

/** Envelope every v3 endpoint responds with. */
interface SmartEmailingEnvelope<T> {
  status?: string
  message?: string
  meta?: unknown
  data?: T
}

const DEFAULT_TIMEOUT_MS = 20_000
const DEFAULT_MAX_ATTEMPTS = 3
/** Cap on how long we honour a `Retry-After` before giving up instead. */
const MAX_RETRY_DELAY_MS = 10_000

function authHeader({ user, apiKey }: SmartEmailingConfig): string {
  return `Basic ${Buffer.from(`${user}:${apiKey}`).toString('base64')}`
}

/**
 * Delay before the next attempt: the server's `Retry-After` when present,
 * otherwise exponential backoff (0.5s, 1s, 2s…). Returns null when the
 * requested wait is longer than we are willing to block a request for.
 */
function retryDelayMs(response: Response | null, attempt: number): number | null {
  const retryAfter = response?.headers.get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) {
      const ms = seconds * 1000
      return ms > MAX_RETRY_DELAY_MS ? null : ms
    }
  }
  return 500 * 2 ** (attempt - 1)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Performs a single API call with retries on 429 and 5xx.
 *
 * `path` is relative to the API root, e.g. `/import` or
 * `/contacts/in-lists?status=unsubscribed`.
 */
export async function seFetch<T>(
  path: string,
  init: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: unknown
    /**
     * Time budget per attempt. Requests made while a user waits pass a much
     * smaller value than background jobs do.
     */
    timeoutMs?: number
    /** 1 disables retries - used on the interactive path. */
    maxAttempts?: number
  } = {
    method: 'GET',
  }
): Promise<SmartEmailingResult<T>> {
  const config = getSmartEmailingConfig()
  if (!config) {
    return { ok: false, error: 'SmartEmailing není nakonfigurován' }
  }

  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxAttempts = init.maxAttempts ?? DEFAULT_MAX_ATTEMPTS

  let lastError = 'Unknown SmartEmailing error'
  let lastStatus: number | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response: Response
    try {
      response = await fetch(`${SMARTEMAILING_BASE_URL}${path}`, {
        method: init.method,
        headers: {
          Authorization: authHeader(config),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: AbortSignal.timeout(timeoutMs),
        cache: 'no-store',
      })
    } catch (error) {
      // Network error or timeout - retry, these are usually transient.
      lastError = error instanceof Error ? error.message : 'Network error'
      lastStatus = undefined
      const delay = retryDelayMs(null, attempt)
      if (attempt < maxAttempts && delay !== null) {
        await sleep(delay)
        continue
      }
      break
    }

    lastStatus = response.status

    if (response.status === 429 || response.status >= 500) {
      const delay = retryDelayMs(response, attempt)
      lastError = `SmartEmailing returned ${response.status}`
      if (attempt < maxAttempts && delay !== null) {
        logger.warn('Retrying SmartEmailing request', {
          path,
          status: response.status,
          attempt,
          delay,
        })
        await sleep(delay)
        continue
      }
      break
    }

    // 204 No Content and other empty bodies are still a success.
    const text = await response.text()
    let envelope: SmartEmailingEnvelope<T> = {}
    if (text) {
      try {
        envelope = JSON.parse(text) as SmartEmailingEnvelope<T>
      } catch {
        if (response.ok) {
          return { ok: false, error: 'Neplatná odpověď SmartEmailing API' }
        }
        return {
          ok: false,
          error: `SmartEmailing returned ${response.status}`,
          status: response.status,
        }
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        error: envelope.message || `SmartEmailing returned ${response.status}`,
        status: response.status,
      }
    }

    return { ok: true, data: (envelope.data ?? null) as T }
  }

  return { ok: false, error: lastError, status: lastStatus }
}
