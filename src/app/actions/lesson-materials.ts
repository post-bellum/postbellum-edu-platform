'use server'

import { revalidatePath } from 'next/cache'
import {
  createLessonMaterial,
  updateLessonMaterial,
  deleteLessonMaterial,
} from '@/lib/supabase/lesson-materials'
import { logger } from '@/lib/logger'
import { isValidUUID } from '@/lib/validation'
import {
  createLessonMaterialSchema,
  updateLessonMaterialSchema,
  parseFormDataForLessonMaterial,
} from '@/lib/schemas/lesson.schema'

export async function createLessonMaterialAction(formData: FormData) {
  try {
    // Parse FormData into object format expected by Zod
    const rawData = parseFormDataForLessonMaterial(formData)
    
    // Validate and sanitize using Zod schema
    const result = createLessonMaterialSchema.safeParse(rawData)
    
    if (!result.success) {
      // Return first error message from Zod
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const material = await createLessonMaterial(result.data)
    
    revalidatePath(`/lessons/${result.data.lesson_id}`)
    revalidatePath(`/lessons/${result.data.lesson_id}/edit`)
    
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

    // Parse FormData into object format expected by Zod
    const rawData = parseFormDataForLessonMaterial(formData)
    
    // Validate and sanitize using Zod schema
    const result = updateLessonMaterialSchema.safeParse(rawData)
    
    if (!result.success) {
      // Return first error message from Zod
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const material = await updateLessonMaterial(materialId, result.data)
    
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

