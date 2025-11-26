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

export async function createLessonMaterialAction(formData: FormData) {
  try {
    const input: CreateLessonMaterialInput = {
      lesson_id: formData.get('lesson_id') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      content: formData.get('content') as string || undefined,
      specification: formData.get('specification') as CreateLessonMaterialInput['specification'] || undefined,
      duration: formData.get('duration') 
        ? parseInt(formData.get('duration') as string) as CreateLessonMaterialInput['duration']
        : undefined,
    }

    if (!input.lesson_id || !input.title) {
      return {
        success: false,
        error: 'ID lekce a název jsou povinné',
      }
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
    const input: UpdateLessonMaterialInput = {
      title: formData.get('title') as string || undefined,
      description: formData.get('description') as string || undefined,
      content: formData.get('content') as string || undefined,
      specification: formData.get('specification') as UpdateLessonMaterialInput['specification'] || undefined,
      duration: formData.get('duration')
        ? parseInt(formData.get('duration') as string) as UpdateLessonMaterialInput['duration']
        : undefined,
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

