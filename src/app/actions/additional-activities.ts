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

export async function createAdditionalActivityAction(formData: FormData) {
  try {
    const input: CreateAdditionalActivityInput = {
      lesson_id: formData.get('lesson_id') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      image_url: formData.get('image_url') as string || undefined,
    }

    if (!input.lesson_id || !input.title) {
      return {
        success: false,
        error: 'ID lekce a název jsou povinné',
      }
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
    const input: UpdateAdditionalActivityInput = {
      title: formData.get('title') as string || undefined,
      description: formData.get('description') as string || undefined,
      image_url: formData.get('image_url') as string || undefined,
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

