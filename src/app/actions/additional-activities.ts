'use server'

import { revalidatePath } from 'next/cache'
import {
  createAdditionalActivity,
  updateAdditionalActivity,
  deleteAdditionalActivity,
} from '@/lib/supabase/additional-activities'
import { logger } from '@/lib/logger'
import { isValidUUID } from '@/lib/validation'
import {
  createAdditionalActivitySchema,
  updateAdditionalActivitySchema,
  parseFormDataForAdditionalActivity,
} from '@/lib/schemas/lesson.schema'

export async function createAdditionalActivityAction(formData: FormData) {
  try {
    // Parse FormData into object format expected by Zod
    const rawData = parseFormDataForAdditionalActivity(formData)
    
    // Validate and sanitize using Zod schema
    const result = createAdditionalActivitySchema.safeParse(rawData)
    
    if (!result.success) {
      // Return first error message from Zod
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const activity = await createAdditionalActivity(result.data)
    
    revalidatePath(`/lessons/${result.data.lesson_id}`)
    revalidatePath(`/lessons/${result.data.lesson_id}/edit`)
    
    return {
      success: true,
      data: activity,
    }
  } catch (error) {
    logger.error('Error creating additional activity', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při vytváření aktivity',
    }
  }
}

export async function updateAdditionalActivityAction(activityId: string, formData: FormData) {
  try {
    // Validate activity ID
    if (!activityId || !isValidUUID(activityId)) {
      return {
        success: false,
        error: 'Neplatné ID aktivity',
      }
    }

    // Parse FormData into object format expected by Zod
    const rawData = parseFormDataForAdditionalActivity(formData)
    
    // Validate and sanitize using Zod schema
    const result = updateAdditionalActivitySchema.safeParse(rawData)
    
    if (!result.success) {
      // Return first error message from Zod
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const activity = await updateAdditionalActivity(activityId, result.data)
    
    revalidatePath(`/lessons/${activity.lesson_id}`)
    revalidatePath(`/lessons/${activity.lesson_id}/edit`)
    
    return {
      success: true,
      data: activity,
    }
  } catch (error) {
    logger.error('Error updating additional activity', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při aktualizaci aktivity',
    }
  }
}

export async function deleteAdditionalActivityAction(activityId: string, lessonId: string) {
  try {
    // Validate IDs
    if (!activityId || !isValidUUID(activityId)) {
      return {
        success: false,
        error: 'Neplatné ID aktivity',
      }
    }

    if (!lessonId || !isValidUUID(lessonId)) {
      return {
        success: false,
        error: 'Neplatné ID lekce',
      }
    }

    await deleteAdditionalActivity(activityId)
    
    revalidatePath(`/lessons/${lessonId}`)
    revalidatePath(`/lessons/${lessonId}/edit`)
    
    return {
      success: true,
    }
  } catch (error) {
    logger.error('Error deleting additional activity', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při mazání aktivity',
    }
  }
}



