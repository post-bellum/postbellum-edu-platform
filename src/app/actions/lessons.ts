'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createLesson,
  updateLesson,
  deleteLesson,
} from '@/lib/supabase/lessons'
import { logger } from '@/lib/logger'
import { isValidUUID } from '@/lib/validation'
import {
  createLessonSchema,
  updateLessonSchema,
  parseFormDataForLesson,
} from '@/lib/schemas/lesson.schema'

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
    redirect('/lessons')
  } catch (error) {
    // Next.js redirect() throws a special error that should be re-thrown
    // Check if it's a redirect error by checking the digest property
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = String(error.digest)
      if (digest.startsWith('NEXT_REDIRECT')) {
        throw error // Re-throw redirect errors so Next.js can handle them
      }
    }
    
    logger.error('Error deleting lesson', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při mazání lekce',
    }
  }
}
