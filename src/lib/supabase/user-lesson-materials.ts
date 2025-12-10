'use server'

import { createClient } from './server'
import { logger } from '@/lib/logger'
import type { UserLessonMaterial } from '@/types/lesson.types'
import type {
  CreateUserLessonMaterialInput,
  UpdateUserLessonMaterialInput,
} from '@/lib/schemas/lesson.schema'

/**
 * Get all user lesson materials for a specific lesson
 */
export async function getUserLessonMaterials(lessonId: string): Promise<UserLessonMaterial[]> {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      // Not logged in - return empty array
      return []
    }

    const { data, error } = await supabase
      .from('user_lesson_materials')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching user lesson materials:', error)
      throw error
    }

    return (data || []) as UserLessonMaterial[]
  } catch (error) {
    logger.error('Error fetching user lesson materials:', error)
    throw error
  }
}

/**
 * Get a single user lesson material by ID
 */
export async function getUserLessonMaterialById(id: string): Promise<UserLessonMaterial | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_lesson_materials')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Error fetching user lesson material:', error)
      return null
    }

    return data as UserLessonMaterial
  } catch (error) {
    logger.error('Error fetching user lesson material:', error)
    return null
  }
}

/**
 * Create a user lesson material (copy from original material)
 */
export async function createUserLessonMaterial(
  input: CreateUserLessonMaterialInput
): Promise<UserLessonMaterial> {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Musíte být přihlášeni pro vytvoření materiálu')
    }

    const { data, error } = await supabase
      .from('user_lesson_materials')
      .insert({
        ...input,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating user lesson material:', error)
      throw error
    }

    return data as UserLessonMaterial
  } catch (error) {
    logger.error('Error creating user lesson material:', error)
    throw error
  }
}

/**
 * Update a user lesson material
 */
export async function updateUserLessonMaterial(
  id: string,
  input: UpdateUserLessonMaterialInput
): Promise<UserLessonMaterial> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_lesson_materials')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating user lesson material:', error)
      throw error
    }

    return data as UserLessonMaterial
  } catch (error) {
    logger.error('Error updating user lesson material:', error)
    throw error
  }
}

/**
 * Delete a user lesson material
 */
export async function deleteUserLessonMaterial(id: string): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('user_lesson_materials')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Error deleting user lesson material:', error)
      throw error
    }
  } catch (error) {
    logger.error('Error deleting user lesson material:', error)
    throw error
  }
}
