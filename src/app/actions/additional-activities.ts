'use server'

import { revalidatePath } from 'next/cache'
import {
  createAdditionalActivity,
  updateAdditionalActivity,
  deleteAdditionalActivity,
} from '@/lib/supabase/additional-activities'
import type {
  CreateAdditionalActivityInput,
  UpdateAdditionalActivityInput,
} from '@/types/lesson.types'
import { logger } from '@/lib/logger'
import { sanitizeInput } from '@/lib/sanitize'
import { isValidUUID, isValidUrl } from '@/lib/validation'

export async function createAdditionalActivityAction(formData: FormData) {
  try {
    const lessonId = formData.get('lesson_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string || undefined
    const imageUrl = formData.get('image_url') as string || undefined

    // Validate required fields
    if (!lessonId || !isValidUUID(lessonId)) {
      return {
        success: false,
        error: 'Neplatné ID lekce',
      }
    }

    if (!title || !title.trim()) {
      return {
        success: false,
        error: 'Název aktivity je povinný',
      }
    }

    // Validate image URL if provided
    if (imageUrl && !isValidUrl(imageUrl)) {
      return {
        success: false,
        error: 'Neplatná URL adresa obrázku',
      }
    }

    // Sanitize all text inputs
    const input: CreateAdditionalActivityInput = {
      lesson_id: lessonId,
      title: sanitizeInput(title.trim()),
      description: description ? sanitizeInput(description.trim()) : undefined,
      image_url: imageUrl ? sanitizeInput(imageUrl.trim()) : undefined,
    }

    const activity = await createAdditionalActivity(input)
    
    revalidatePath(`/lessons/${input.lesson_id}`)
    revalidatePath(`/lessons/${input.lesson_id}/edit`)
    
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

    const title = formData.get('title') as string || undefined
    const description = formData.get('description') as string || undefined
    const imageUrl = formData.get('image_url') as string || undefined

    // Validate image URL if provided
    if (imageUrl && !isValidUrl(imageUrl)) {
      return {
        success: false,
        error: 'Neplatná URL adresa obrázku',
      }
    }

    // Sanitize all text inputs
    const input: UpdateAdditionalActivityInput = {
      title: title ? sanitizeInput(title.trim()) : undefined,
      description: description ? sanitizeInput(description.trim()) : undefined,
      image_url: imageUrl ? sanitizeInput(imageUrl.trim()) : undefined,
    }

    const activity = await updateAdditionalActivity(activityId, input)
    
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

