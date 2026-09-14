'use server'

import { createClient } from './server'
import { requireAdmin } from './admin-helpers'
import { logger } from '@/lib/logger'
import type { 
  LessonMaterial,
  CreateLessonMaterialInput,
  UpdateLessonMaterialInput,
  LessonSpecification,
  LessonDuration
} from '@/types/lesson.types'

/**
 * Extract the object path from a public storage URL.
 * Inlined instead of imported from lib/supabase/storage so this server module
 * does not pull in the browser Supabase client.
 */
function extractStoragePath(url: string, bucket = 'lesson-materials'): string | null {
  try {
    const pathMatch = new URL(url).pathname.match(new RegExp(`/${bucket}/(.+)`))
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}

/**
 * Get all materials for a lesson
 */
export async function getLessonMaterials(lessonId: string): Promise<LessonMaterial[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lesson_materials')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Error fetching lesson materials:', error)
      throw error
    }

    return (data || []) as LessonMaterial[]
  } catch (error) {
    logger.error('Error fetching lesson materials:', error)
    throw error
  }
}

/**
 * Get materials filtered by specification and duration
 */
export async function getLessonMaterialsFiltered(
  lessonId: string,
  specification?: LessonSpecification,
  duration?: LessonDuration
): Promise<LessonMaterial[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('lesson_materials')
      .select('*')
      .eq('lesson_id', lessonId)

    if (specification) {
      query = query.eq('specification', specification)
    }
    if (duration) {
      query = query.eq('duration', duration)
    }

    const { data, error } = await query.order('created_at', { ascending: true })

    if (error) {
      logger.error('Error fetching filtered lesson materials:', error)
      throw error
    }

    return (data || []) as LessonMaterial[]
  } catch (error) {
    logger.error('Error fetching filtered lesson materials:', error)
    throw error
  }
}

/**
 * Get a single material by ID
 */
export async function getLessonMaterialById(id: string): Promise<LessonMaterial | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lesson_materials')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Error fetching lesson material:', error)
      return null
    }

    return data as LessonMaterial
  } catch (error) {
    logger.error('Error fetching lesson material:', error)
    return null
  }
}

/**
 * Create a new lesson material (admin only)
 */
export async function createLessonMaterial(input: CreateLessonMaterialInput): Promise<LessonMaterial> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lesson_materials')
      .insert(input)
      .select()
      .single()

    if (error) {
      logger.error('Error creating lesson material:', error)
      throw error
    }

    return data as LessonMaterial
  } catch (error) {
    logger.error('Error creating lesson material:', error)
    throw error
  }
}

/**
 * Update a lesson material (admin only)
 */
export async function updateLessonMaterial(
  id: string,
  input: UpdateLessonMaterialInput
): Promise<LessonMaterial> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lesson_materials')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating lesson material:', error)
      throw error
    }

    return data as LessonMaterial
  } catch (error) {
    logger.error('Error updating lesson material:', error)
    throw error
  }
}

/**
 * Delete a lesson material (admin only)
 */
export async function deleteLessonMaterial(id: string): Promise<void> {
  await requireAdmin()

  try {
    const supabase = await createClient()

    // Remove the uploaded PDF first so deleting a material never leaves an
    // orphaned file behind. A storage failure must not block the row delete.
    const { data: existing } = await supabase
      .from('lesson_materials')
      .select('pdf_url')
      .eq('id', id)
      .single()

    const pdfUrl = (existing as { pdf_url: string | null } | null)?.pdf_url
    if (pdfUrl) {
      const path = extractStoragePath(pdfUrl)
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('lesson-materials')
          .remove([path])
        if (storageError) {
          logger.error('Error deleting material PDF from storage:', storageError)
        }
      }
    }

    const { error } = await supabase
      .from('lesson_materials')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Error deleting lesson material:', error)
      throw error
    }
  } catch (error) {
    logger.error('Error deleting lesson material:', error)
    throw error
  }
}

