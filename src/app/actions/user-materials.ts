'use server'

import { getAllUserLessonMaterials } from '@/lib/supabase/user-lesson-materials'
import { logger } from '@/lib/logger'

/**
 * Get all user lesson materials across all lessons
 */
export async function getAllUserMaterialsAction() {
  try {
    const materials = await getAllUserLessonMaterials()
    
    return {
      success: true,
      data: materials,
    }
  } catch (error) {
    logger.error('Error fetching user materials', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při načítání materiálů',
      data: [],
    }
  }
}

