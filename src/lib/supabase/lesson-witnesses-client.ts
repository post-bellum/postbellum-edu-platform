'use client'

import { createClient } from './client'
import { logger } from '@/lib/logger'
import type { LessonWitness } from '@/types/lesson.types'

/**
 * Get all witnesses for a lesson (client-side)
 */
export async function getLessonWitnesses(lessonId: string): Promise<LessonWitness[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('lesson_witnesses')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Error fetching lesson witnesses:', error)
      return []
    }

    return (data || []) as LessonWitness[]
  } catch (error) {
    logger.error('Error fetching lesson witnesses:', error)
    return []
  }
}
