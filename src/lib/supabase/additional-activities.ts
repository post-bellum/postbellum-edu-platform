'use server'

import { createClient } from './server'
import { requireAdmin } from './admin-helpers'
import { logger } from '@/lib/logger'
import type { 
  AdditionalActivity,
  CreateAdditionalActivityInput,
  UpdateAdditionalActivityInput
} from '@/types/lesson.types'

/**
 * Get all additional activities for a lesson
 */
export async function getAdditionalActivities(lessonId: string): Promise<AdditionalActivity[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('additional_activities')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Error fetching additional activities:', error)
      throw error
    }

    return (data || []) as AdditionalActivity[]
  } catch (error) {
    logger.error('Error fetching additional activities:', error)
    throw error
  }
}

/**
 * Get a single additional activity by ID
 */
export async function getAdditionalActivityById(id: string): Promise<AdditionalActivity | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('additional_activities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logger.error('Error fetching additional activity:', error)
      return null
    }

    return data as AdditionalActivity
  } catch (error) {
    logger.error('Error fetching additional activity:', error)
    return null
  }
}

/**
 * Create a new additional activity (admin only)
 */
export async function createAdditionalActivity(
  input: CreateAdditionalActivityInput
): Promise<AdditionalActivity> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('additional_activities')
      .insert(input)
      .select()
      .single()

    if (error) {
      logger.error('Error creating additional activity:', error)
      throw error
    }

    return data as AdditionalActivity
  } catch (error) {
    logger.error('Error creating additional activity:', error)
    throw error
  }
}

/**
 * Update an additional activity (admin only)
 */
export async function updateAdditionalActivity(
  id: string,
  input: UpdateAdditionalActivityInput
): Promise<AdditionalActivity> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('additional_activities')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating additional activity:', error)
      throw error
    }

    return data as AdditionalActivity
  } catch (error) {
    logger.error('Error updating additional activity:', error)
    throw error
  }
}

/**
 * Delete an additional activity (admin only)
 */
export async function deleteAdditionalActivity(id: string): Promise<void> {
  await requireAdmin()

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('additional_activities')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Error deleting additional activity:', error)
      throw error
    }
  } catch (error) {
    logger.error('Error deleting additional activity:', error)
    throw error
  }
}

