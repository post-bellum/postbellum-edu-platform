'use server'

import { createClient } from './server'
import { requireAdmin } from './admin-helpers'
import { logger } from '@/lib/logger'
import type {
  LessonWitness,
  CreateLessonWitnessInput,
  UpdateLessonWitnessInput
} from '@/types/lesson.types'

/**
 * Get all witnesses for a lesson
 * Ordered by sort_order, with created_at as a stable tie-breaker
 */
export async function getLessonWitnesses(lessonId: string): Promise<LessonWitness[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lesson_witnesses')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Error fetching lesson witnesses:', error)
      throw error
    }

    return (data || []) as LessonWitness[]
  } catch (error) {
    logger.error('Error fetching lesson witnesses:', error)
    throw error
  }
}

/**
 * Get a single lesson witness by ID
 */
export async function getLessonWitnessById(id: string): Promise<LessonWitness | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lesson_witnesses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Error fetching lesson witness:', error)
      return null
    }

    return data as LessonWitness
  } catch (error) {
    logger.error('Error fetching lesson witness:', error)
    return null
  }
}

/**
 * Create a new lesson witness (admin only)
 */
export async function createLessonWitness(
  input: CreateLessonWitnessInput
): Promise<LessonWitness> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lesson_witnesses')
      .insert(input)
      .select()
      .single()

    if (error) {
      logger.error('Error creating lesson witness:', error)
      throw error
    }

    return data as LessonWitness
  } catch (error) {
    logger.error('Error creating lesson witness:', error)
    throw error
  }
}

/**
 * Update a lesson witness (admin only)
 */
export async function updateLessonWitness(
  id: string,
  input: UpdateLessonWitnessInput
): Promise<LessonWitness> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lesson_witnesses')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating lesson witness:', error)
      throw error
    }

    return data as LessonWitness
  } catch (error) {
    logger.error('Error updating lesson witness:', error)
    throw error
  }
}

/**
 * Delete a lesson witness (admin only)
 */
export async function deleteLessonWitness(id: string): Promise<void> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('lesson_witnesses')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Error deleting lesson witness:', error)
      throw error
    }
  } catch (error) {
    logger.error('Error deleting lesson witness:', error)
    throw error
  }
}
