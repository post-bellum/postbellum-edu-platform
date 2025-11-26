'use server'

import { revalidatePath } from 'next/cache'
import {
  createLessonMaterial,
  updateLessonMaterial,
  deleteLessonMaterial,
} from '@/lib/supabase/lesson-materials'
import type {
  CreateLessonMaterialInput,
  UpdateLessonMaterialInput,
} from '@/types/lesson.types'
import { logger } from '@/lib/logger'
import { sanitizeInput } from '@/lib/sanitize'
import { isValidUUID } from '@/lib/validation'

export async function createLessonMaterialAction(formData: FormData) {
  try {
    const lessonId = formData.get('lesson_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string || undefined
    const content = formData.get('content') as string || undefined
    const specification = formData.get('specification') as CreateLessonMaterialInput['specification'] || undefined
    const duration = formData.get('duration') as string || undefined

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
        error: 'Název materiálu je povinný',
      }
    }

    // Validate duration if provided
    let durationValue: CreateLessonMaterialInput['duration'] | undefined
    if (duration) {
      const parsed = parseInt(duration)
      if (![30, 45, 90].includes(parsed)) {
        return {
          success: false,
          error: 'Neplatná délka materiálu (povolené hodnoty: 30, 45, 90)',
        }
      }
      durationValue = parsed as CreateLessonMaterialInput['duration']
    }

    // Sanitize all text inputs
    const input: CreateLessonMaterialInput = {
      lesson_id: lessonId,
      title: sanitizeInput(title.trim()),
      description: description ? sanitizeInput(description.trim()) : undefined,
      content: content ? sanitizeInput(content.trim()) : undefined,
      specification,
      duration: durationValue,
    }

    const material = await createLessonMaterial(input)
    
    revalidatePath(`/lessons/${input.lesson_id}`)
    revalidatePath(`/lessons/${input.lesson_id}/edit`)
    
    return {
      success: true,
      data: material,
    }
  } catch (error) {
    logger.error('Error creating lesson material', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při vytváření materiálu',
    }
  }
}

export async function updateLessonMaterialAction(materialId: string, formData: FormData) {
  try {
    // Validate material ID
    if (!materialId || !isValidUUID(materialId)) {
      return {
        success: false,
        error: 'Neplatné ID materiálu',
      }
    }

    const title = formData.get('title') as string || undefined
    const description = formData.get('description') as string || undefined
    const content = formData.get('content') as string || undefined
    const specification = formData.get('specification') as UpdateLessonMaterialInput['specification'] || undefined
    const duration = formData.get('duration') as string || undefined

    // Validate duration if provided
    let durationValue: UpdateLessonMaterialInput['duration'] | undefined
    if (duration) {
      const parsed = parseInt(duration)
      if (![30, 45, 90].includes(parsed)) {
        return {
          success: false,
          error: 'Neplatná délka materiálu (povolené hodnoty: 30, 45, 90)',
        }
      }
      durationValue = parsed as UpdateLessonMaterialInput['duration']
    }

    // Sanitize all text inputs
    const input: UpdateLessonMaterialInput = {
      title: title ? sanitizeInput(title.trim()) : undefined,
      description: description ? sanitizeInput(description.trim()) : undefined,
      content: content ? sanitizeInput(content.trim()) : undefined,
      specification,
      duration: durationValue,
    }

    const material = await updateLessonMaterial(materialId, input)
    
    revalidatePath(`/lessons/${material.lesson_id}`)
    revalidatePath(`/lessons/${material.lesson_id}/edit`)
    
    return {
      success: true,
      data: material,
    }
  } catch (error) {
    logger.error('Error updating lesson material', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při aktualizaci materiálu',
    }
  }
}

export async function deleteLessonMaterialAction(materialId: string, lessonId: string) {
  try {
    // Validate IDs
    if (!materialId || !isValidUUID(materialId)) {
      return {
        success: false,
        error: 'Neplatné ID materiálu',
      }
    }

    if (!lessonId || !isValidUUID(lessonId)) {
      return {
        success: false,
        error: 'Neplatné ID lekce',
      }
    }

    await deleteLessonMaterial(materialId)
    
    revalidatePath(`/lessons/${lessonId}`)
    revalidatePath(`/lessons/${lessonId}/edit`)
    
    return {
      success: true,
    }
  } catch (error) {
    logger.error('Error deleting lesson material', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při mazání materiálu',
    }
  }
}

