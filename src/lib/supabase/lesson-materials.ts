"use server"

import { createClient } from "./server"
import { requireAdmin } from "./admin-helpers"
import { logger } from "@/lib/logger"
import type { 
  LessonMaterial,
  CreateLessonMaterialInput,
  UpdateLessonMaterialInput,
  LessonSpecification,
  LessonDuration
} from "@/types/lesson.types"

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
      logger.error("Error fetching lesson materials:", error)
      throw error
    }

    return (data || []) as LessonMaterial[]
  } catch (error) {
    logger.error("Error fetching lesson materials:", error)
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
      logger.error("Error fetching filtered lesson materials:", error)
      throw error
    }

    return (data || []) as LessonMaterial[]
  } catch (error) {
    logger.error("Error fetching filtered lesson materials:", error)
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
      logger.error("Error fetching lesson material:", error)
      return null
    }

    return data as LessonMaterial
  } catch (error) {
    logger.error("Error fetching lesson material:", error)
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
      logger.error("Error creating lesson material:", error)
      throw error
    }

    return data as LessonMaterial
  } catch (error) {
    logger.error("Error creating lesson material:", error)
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
      logger.error("Error updating lesson material:", error)
      throw error
    }

    return data as LessonMaterial
  } catch (error) {
    logger.error("Error updating lesson material:", error)
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
    const { error } = await supabase
      .from('lesson_materials')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error("Error deleting lesson material:", error)
      throw error
    }
  } catch (error) {
    logger.error("Error deleting lesson material:", error)
    throw error
  }
}

