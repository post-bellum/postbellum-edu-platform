import { Resend } from 'resend'
import { logger } from '@/lib/logger'

/**
 * Transactional email sending via Resend.
 *
 * ⚠️ Server-only. Never import from a client component - it reads
 * RESEND_API_KEY from the environment.
 *
 * Supabase Auth sends its own emails (OTP, password reset); this module is for
 * the app's own notifications to the admin inbox.
 */

export interface SendAdminEmailParams {
  subject: string
  /** Plain text body. No HTML templates - these are internal notifications. */
  text: string
  /** Address the admin replies to (e.g. the user who submitted a suggestion). */
  replyTo?: string
}

export type SendAdminEmailResult =
  | { sent: true }
  | { sent: false; error: string }

/**
 * Sends a plain text email to the admin inbox(es) configured in
 * SUGGESTIONS_EMAIL_TO (comma-separated for several recipients).
 *
 * Never throws: a missing configuration or a provider outage is reported as
 * `{ sent: false, error }` so the caller can record it and still succeed for
 * the user.
 */
export async function sendAdminEmail({
  subject,
  text,
  replyTo,
}: SendAdminEmailParams): Promise<SendAdminEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.SUGGESTIONS_EMAIL_FROM?.trim()

  // One or more recipients, comma-separated in the environment
  const to = (process.env.SUGGESTIONS_EMAIL_TO ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean)

  if (!apiKey || to.length === 0 || !from) {
    const missing = [
      !apiKey && 'RESEND_API_KEY',
      to.length === 0 && 'SUGGESTIONS_EMAIL_TO',
      !from && 'SUGGESTIONS_EMAIL_FROM',
    ]
      .filter(Boolean)
      .join(', ')
    const error = `Email not configured (missing ${missing})`
    logger.warn('Skipping admin email', { subject, error })
    return { sent: false, error }
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      ...(replyTo ? { replyTo } : {}),
    })

    if (error) {
      logger.error('Resend rejected admin email', error)
      return { sent: false, error: error.message || 'Resend error' }
    }

    return { sent: true }
  } catch (error) {
    logger.error('Error sending admin email', error)
    return {
      sent: false,
      error: error instanceof Error ? error.message : 'Unknown email error',
    }
  }
}
