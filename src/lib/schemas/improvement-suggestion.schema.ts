import { z } from 'zod'
import { sanitizeInput } from '@/lib/sanitize'
import { IMPROVEMENT_SUGGESTION_CONSTANTS } from '@/lib/constants'

/**
 * Improvement suggestion submitted from the lesson detail dialog.
 *
 * The message is sanitized BEFORE the length check (via `.pipe`), so a message
 * that only looks long enough because of markup is rejected rather than stored
 * as a near-empty string.
 */
export const improvementSuggestionSchema = z.object({
  message: z
    .string()
    .max(
      // Generous pre-sanitization cap so a huge payload is rejected before any
      // work is done on it; the real limit is checked below.
      IMPROVEMENT_SUGGESTION_CONSTANTS.MESSAGE_MAX_LENGTH * 4,
      'Návrh je příliš dlouhý.'
    )
    .transform((value) => sanitizeInput(value.trim()))
    .pipe(
      z
        .string()
        .min(
          IMPROVEMENT_SUGGESTION_CONSTANTS.MESSAGE_MIN_LENGTH,
          `Napište prosím alespoň ${IMPROVEMENT_SUGGESTION_CONSTANTS.MESSAGE_MIN_LENGTH} znaků.`
        )
        .max(
          IMPROVEMENT_SUGGESTION_CONSTANTS.MESSAGE_MAX_LENGTH,
          `Návrh může mít nejvýše ${IMPROVEMENT_SUGGESTION_CONSTANTS.MESSAGE_MAX_LENGTH} znaků.`
        )
    ),
  lessonId: z.string().uuid('Neplatné ID lekce').optional(),
})

export type ImprovementSuggestionInput = z.infer<typeof improvementSuggestionSchema>
