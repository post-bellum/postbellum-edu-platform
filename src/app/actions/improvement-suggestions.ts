'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdminEmail } from '@/lib/email/resend'
import { improvementSuggestionSchema } from '@/lib/schemas/improvement-suggestion.schema'
import { IMPROVEMENT_SUGGESTION_CONSTANTS } from '@/lib/constants'
import { logger } from '@/lib/logger'

async function getBaseUrl() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export interface SubmitImprovementSuggestionResult {
  success: boolean
  error?: string
}

/**
 * Handles the "Poslat návrh na zlepšení" dialog.
 *
 * The suggestion is stored in the database first and only then emailed to the
 * admin inbox: a failure of the email provider must never lose the suggestion,
 * and it is not reported to the user either - from their point of view the
 * suggestion is delivered, and a missing/broken email setup is ours to fix
 * (visible in improvement_suggestions.email_error).
 */
export async function submitImprovementSuggestionAction(
  formData: FormData
): Promise<SubmitImprovementSuggestionResult> {
  try {
    // Identity comes exclusively from the session - never from the form
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Pro odeslání návrhu se prosím přihlaste.',
      }
    }

    const parsed = improvementSuggestionSchema.safeParse({
      message: formData.get('message')?.toString() ?? '',
      lessonId: formData.get('lesson_id')?.toString() || undefined,
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const { message, lessonId } = parsed.data
    const admin = createAdminClient()

    // Throttle per user. Done in the database because serverless instances
    // don't share memory, so an in-process counter would be meaningless.
    const windowStart = new Date(
      Date.now() - IMPROVEMENT_SUGGESTION_CONSTANTS.THROTTLE_WINDOW_MINUTES * 60_000
    ).toISOString()

    const { count, error: countError } = await admin
      .from('improvement_suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', windowStart)

    if (countError) {
      logger.error('Error checking improvement suggestion throttle', countError)
    } else if (
      (count ?? 0) >= IMPROVEMENT_SUGGESTION_CONSTANTS.THROTTLE_MAX_SUBMISSIONS
    ) {
      return {
        success: false,
        error: 'Návrh jste právě poslali. Zkuste to prosím za chvíli.',
      }
    }

    // Resolve the lesson server-side - the title in the email and in the record
    // must not be something the client made up.
    let lessonTitle: string | null = null
    let lessonUrl: string | null = null

    if (lessonId) {
      const { data: lesson, error: lessonError } = await admin
        .from('lessons')
        .select('id, title, short_id')
        .eq('id', lessonId)
        .maybeSingle()

      if (lessonError) {
        logger.error('Error loading lesson for improvement suggestion', lessonError)
      } else if (lesson) {
        lessonTitle = lesson.title
        lessonUrl = `${await getBaseUrl()}/lessons/${lesson.short_id || lesson.id}`
      }
    }

    const { data: suggestion, error: insertError } = await admin
      .from('improvement_suggestions')
      .insert({
        user_id: user.id,
        user_email: user.email ?? null,
        lesson_id: lessonId ?? null,
        lesson_title: lessonTitle,
        message,
      })
      .select('id')
      .single()

    if (insertError || !suggestion) {
      logger.error('Error storing improvement suggestion', insertError)
      return {
        success: false,
        error: 'Návrh se nepodařilo odeslat. Zkuste to prosím znovu.',
      }
    }

    // Notify the admin inbox. Everything below is best-effort.
    const bodyLines = [
      lessonTitle ? `Lekce: ${lessonTitle}` : 'Lekce: neuvedena',
      lessonUrl ? `Odkaz: ${lessonUrl}` : null,
      `Od: ${user.email ?? 'neznámý e-mail'}`,
      '',
      message,
    ].filter((line): line is string => line !== null)

    const emailResult = await sendAdminEmail({
      subject: lessonTitle
        ? `Návrh na zlepšení: ${lessonTitle}`
        : 'Návrh na zlepšení platformy storyON',
      text: bodyLines.join('\n'),
      replyTo: user.email ?? undefined,
    })

    const { error: updateError } = await admin
      .from('improvement_suggestions')
      .update(
        emailResult.sent
          ? { email_sent_at: new Date().toISOString(), email_error: null }
          : { email_error: emailResult.error }
      )
      .eq('id', suggestion.id)

    if (updateError) {
      logger.error('Error recording improvement suggestion email status', updateError)
    }

    return { success: true }
  } catch (error) {
    logger.error('Error submitting improvement suggestion', error)
    return {
      success: false,
      error: 'Návrh se nepodařilo odeslat. Zkuste to prosím znovu.',
    }
  }
}
