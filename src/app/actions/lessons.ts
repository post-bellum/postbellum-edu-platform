'use server'

import { revalidatePath } from 'next/cache'
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessons,
} from '@/lib/supabase/lessons'
import { requireAdmin } from '@/lib/supabase/admin-helpers'
import { logger } from '@/lib/logger'
import { isValidUUID } from '@/lib/validation'
import {
  createLessonSchema,
  updateLessonSchema,
  parseFormDataForLesson,
} from '@/lib/schemas/lesson.schema'
import type { LessonWithRelations } from '@/types/lesson.types'

export interface AdminLessonsStats {
  total: number
  published: number
  unpublished: number
}

export async function getAdminLessons(): Promise<{
  success: boolean
  data?: LessonWithRelations[]
  stats?: AdminLessonsStats
  error?: string
}> {
  try {
    await requireAdmin()
    
    const lessons = await getLessons({
      published_only: false,
      include_tags: true,
    })

    const stats: AdminLessonsStats = {
      total: lessons.length,
      published: lessons.filter(l => l.published).length,
      unpublished: lessons.filter(l => !l.published).length,
    }

    return {
      success: true,
      data: lessons,
      stats,
    }
  } catch (error) {
    logger.error('Error fetching admin lessons', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při načítání lekcí',
    }
  }
}

export async function createLessonAction(formData: FormData) {
  try {
    // Parse FormData into object format expected by Zod
    const rawData = parseFormDataForLesson(formData, false)
    
    // Validate and sanitize using Zod schema
    const result = createLessonSchema.safeParse(rawData)
    
    if (!result.success) {
      // Return first error message from Zod
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const lesson = await createLesson(result.data)
    
    revalidatePath('/lessons')
    revalidatePath(`/lessons/${lesson.id}`)
    
    return {
      success: true,
      data: lesson,
    }
  } catch (error) {
    logger.error('Error creating lesson', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při vytváření lekce',
    }
  }
}

export async function updateLessonAction(lessonId: string, formData: FormData) {
  try {
    // Validate lesson ID
    if (!lessonId || !isValidUUID(lessonId)) {
      return {
        success: false,
        error: 'Neplatné ID lekce',
      }
    }

    // Parse FormData into object format expected by Zod
    const rawData = parseFormDataForLesson(formData, true)
    
    // Validate and sanitize using Zod schema
    const result = updateLessonSchema.safeParse(rawData)
    
    if (!result.success) {
      // Return first error message from Zod
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Neplatná data formuláře',
      }
    }

    const lesson = await updateLesson(lessonId, result.data)
    
    revalidatePath('/lessons')
    revalidatePath(`/lessons/${lesson.id}`)
    
    return {
      success: true,
      data: lesson,
    }
  } catch (error) {
    logger.error('Error updating lesson', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při aktualizaci lekce',
    }
  }
}

export async function deleteLessonAction(lessonId: string) {
  try {
    // Validate lesson ID
    if (!lessonId || !isValidUUID(lessonId)) {
      return {
        success: false,
        error: 'Neplatné ID lekce',
      }
    }

    await deleteLesson(lessonId)
    
    revalidatePath('/lessons')
    
    return {
      success: true,
    }
  } catch (error) {
    logger.error('Error deleting lesson', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při mazání lekce',
    }
  }
}
