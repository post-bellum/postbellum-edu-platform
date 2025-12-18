'use server'

import { revalidatePath } from 'next/cache'
import {
  createUserLessonMaterial,
  updateUserLessonMaterial,
  deleteUserLessonMaterial,
} from '@/lib/supabase/user-lesson-materials'
import { getLessonMaterialById } from '@/lib/supabase/lesson-materials'
import { logger } from '@/lib/logger'
import { isValidUUID } from '@/lib/validation'
import {
  createUserLessonMaterialSchema,
  updateUserLessonMaterialSchema,
  parseFormDataForUserLessonMaterial,
} from '@/lib/schemas/lesson.schema'

/**
 * Create a copy of a lesson material for the current user
 */
export async function copyLessonMaterialAction(sourceMaterialId: string, lessonId: string) {
  try {
    // Validate IDs
    if (!sourceMaterialId || !isValidUUID(sourceMaterialId)) {
      return {
        success: false,
        error: 'Neplatné ID zdrojového materiálu',
      }
    }

    if (!lessonId || !isValidUUID(lessonId)) {
      return {
        success: false,
        error: 'Neplatné ID lekce',
      }
    }

    // Get the source material
    const sourceMaterial = await getLessonMaterialById(sourceMaterialId)
    if (!sourceMaterial) {
      return {
        success: false,
        error: 'Zdrojový materiál nebyl nalezen',
      }
    }

    // Ensure source material belongs to the provided lesson
    if (sourceMaterial.lesson_id !== lessonId) {
      return {
        success: false,
        error: 'Materiál nepatří k vybrané lekci',
      }
    }

    // Create the user copy
    const input = {
      source_material_id: sourceMaterialId,
      lesson_id: lessonId,
      title: sourceMaterial.title,
      content: sourceMaterial.content || undefined,
    }

    // Validate using Zod schema
    const result = createUserLessonMaterialSchema.safeParse(input)
    if (!result.success) {
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data',
      }
    }

    const material = await createUserLessonMaterial(result.data)

    revalidatePath(`/lessons/${lessonId}`)

    return {
      success: true,
      data: material,
    }
  } catch (error) {
    logger.error('Error copying lesson material', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při kopírování materiálu',
    }
  }
}

/**
 * Update a user lesson material
 */
export async function updateUserLessonMaterialAction(materialId: string, formData: FormData) {
  try {
    // Validate material ID
    if (!materialId || !isValidUUID(materialId)) {
      return {
        success: false,
        error: 'Neplatné ID materiálu',
      }
    }

    // Parse FormData
    const rawData = parseFormDataForUserLessonMaterial(formData)

    // Validate using Zod schema
    const result = updateUserLessonMaterialSchema.safeParse({
      title: rawData.title,
      content: rawData.content,
    })

    if (!result.success) {
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const material = await updateUserLessonMaterial(materialId, result.data)

    revalidatePath(`/lessons/${material.lesson_id}`)

    return {
      success: true,
      data: material,
    }
  } catch (error) {
    logger.error('Error updating user lesson material', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při aktualizaci materiálu',
    }
  }
}

/**
 * Delete a user lesson material
 */
export async function deleteUserLessonMaterialAction(materialId: string, lessonId: string) {
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

    await deleteUserLessonMaterial(materialId)

    revalidatePath(`/lessons/${lessonId}`)

    return {
      success: true,
    }
  } catch (error) {
    logger.error('Error deleting user lesson material', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při mazání materiálu',
    }
  }
}
