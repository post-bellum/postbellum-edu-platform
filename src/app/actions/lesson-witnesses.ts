'use server'

import { revalidatePath } from 'next/cache'
import {
  createLessonWitness,
  updateLessonWitness,
  deleteLessonWitness,
} from '@/lib/supabase/lesson-witnesses'
import { logger } from '@/lib/logger'
import { isValidUUID } from '@/lib/validation'
import {
  createLessonWitnessSchema,
  updateLessonWitnessSchema,
  parseFormDataForLessonWitness,
} from '@/lib/schemas/lesson.schema'

export async function createLessonWitnessAction(formData: FormData) {
  try {
    // Parse FormData into object format expected by Zod
    const rawData = parseFormDataForLessonWitness(formData)

    // Validate and sanitize using Zod schema
    const result = createLessonWitnessSchema.safeParse(rawData)

    if (!result.success) {
      // Return first error message from Zod
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const witness = await createLessonWitness(result.data)

    revalidatePath(`/lessons/${result.data.lesson_id}`)
    revalidatePath(`/lessons/${result.data.lesson_id}/edit`)

    return {
      success: true,
      data: witness,
    }
  } catch (error) {
    logger.error('Error creating lesson witness', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při vytváření pamětníka',
    }
  }
}

export async function updateLessonWitnessAction(witnessId: string, formData: FormData) {
  try {
    // Validate witness ID
    if (!witnessId || !isValidUUID(witnessId)) {
      return {
        success: false,
        error: 'Neplatné ID pamětníka',
      }
    }

    // Parse FormData into object format expected by Zod
    const rawData = parseFormDataForLessonWitness(formData)

    // Validate and sanitize using Zod schema
    const result = updateLessonWitnessSchema.safeParse(rawData)

    if (!result.success) {
      // Return first error message from Zod
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const witness = await updateLessonWitness(witnessId, result.data)

    revalidatePath(`/lessons/${witness.lesson_id}`)
    revalidatePath(`/lessons/${witness.lesson_id}/edit`)

    return {
      success: true,
      data: witness,
    }
  } catch (error) {
    logger.error('Error updating lesson witness', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při aktualizaci pamětníka',
    }
  }
}

export async function deleteLessonWitnessAction(witnessId: string, lessonId: string) {
  try {
    // Validate IDs
    if (!witnessId || !isValidUUID(witnessId)) {
      return {
        success: false,
        error: 'Neplatné ID pamětníka',
      }
    }

    if (!lessonId || !isValidUUID(lessonId)) {
      return {
        success: false,
        error: 'Neplatné ID lekce',
      }
    }

    await deleteLessonWitness(witnessId)

    revalidatePath(`/lessons/${lessonId}`)
    revalidatePath(`/lessons/${lessonId}/edit`)

    return {
      success: true,
    }
  } catch (error) {
    logger.error('Error deleting lesson witness', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při mazání pamětníka',
    }
  }
}
