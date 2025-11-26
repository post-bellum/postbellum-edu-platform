'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createLesson,
  updateLesson,
  deleteLesson,
} from '@/lib/supabase/lessons'
import type {
  CreateLessonInput,
  UpdateLessonInput,
} from '@/types/lesson.types'
import { logger } from '@/lib/logger'
import { sanitizeInput } from '@/lib/sanitize'
import { isValidUUID, isValidVimeoUrl } from '@/lib/validation'

export async function createLessonAction(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const vimeoVideoUrl = formData.get('vimeo_video_url') as string || undefined
    const description = formData.get('description') as string || undefined
    const duration = formData.get('duration') as string || undefined
    const period = formData.get('period') as string || undefined
    const targetGroup = formData.get('target_group') as string || undefined
    const lessonType = formData.get('lesson_type') as string || undefined
    const publicationDate = formData.get('publication_date') as string || undefined
    const rvpConnection = formData.get('rvp_connection') as string || undefined
    const tagIds = formData.get('tag_ids') as string || undefined

    // Validate required fields
    if (!title || !title.trim()) {
      return {
        success: false,
        error: 'Název lekce je povinný',
      }
    }

    // Validate Vimeo URL if provided
    if (vimeoVideoUrl && !isValidVimeoUrl(vimeoVideoUrl)) {
      return {
        success: false,
        error: 'Neplatná Vimeo URL adresa',
      }
    }

    // Validate tag IDs if provided
    if (tagIds) {
      const tagIdArray = tagIds.split(',').filter(Boolean)
      for (const tagId of tagIdArray) {
        if (!isValidUUID(tagId.trim())) {
          return {
            success: false,
            error: 'Neplatné ID tagu',
          }
        }
      }
    }

    // Sanitize all text inputs
    const input: CreateLessonInput = {
      title: sanitizeInput(title.trim()),
      vimeo_video_url: vimeoVideoUrl ? sanitizeInput(vimeoVideoUrl.trim()) : undefined,
      description: description ? sanitizeInput(description.trim()) : undefined,
      duration: duration ? sanitizeInput(duration.trim()) : undefined,
      period: period ? sanitizeInput(period.trim()) : undefined,
      target_group: targetGroup ? sanitizeInput(targetGroup.trim()) : undefined,
      lesson_type: lessonType ? sanitizeInput(lessonType.trim()) : undefined,
      publication_date: publicationDate ? publicationDate.trim() : undefined,
      published: formData.get('published') === 'true' || formData.get('published') === 'on',
      rvp_connection: rvpConnection
        ? rvpConnection.split(',').map(s => sanitizeInput(s.trim())).filter(Boolean)
        : undefined,
      tag_ids: tagIds
        ? tagIds.split(',').map(s => s.trim()).filter(Boolean).filter(id => isValidUUID(id))
        : undefined,
    }

    const lesson = await createLesson(input)
    
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

    const title = formData.get('title') as string || undefined
    const vimeoVideoUrl = formData.get('vimeo_video_url') as string || undefined
    const description = formData.get('description') as string || undefined
    const duration = formData.get('duration') as string || undefined
    const period = formData.get('period') as string || undefined
    const targetGroup = formData.get('target_group') as string || undefined
    const lessonType = formData.get('lesson_type') as string || undefined
    const publicationDate = formData.get('publication_date') as string || undefined
    const rvpConnection = formData.get('rvp_connection') as string || undefined
    const tagIds = formData.get('tag_ids') as string || undefined

    // Validate Vimeo URL if provided
    if (vimeoVideoUrl && !isValidVimeoUrl(vimeoVideoUrl)) {
      return {
        success: false,
        error: 'Neplatná Vimeo URL adresa',
      }
    }

    // Validate tag IDs if provided
    if (tagIds) {
      const tagIdArray = tagIds.split(',').filter(Boolean)
      for (const tagId of tagIdArray) {
        if (!isValidUUID(tagId.trim())) {
          return {
            success: false,
            error: 'Neplatné ID tagu',
          }
        }
      }
    }

    // Sanitize all text inputs
    const input: UpdateLessonInput = {
      title: title ? sanitizeInput(title.trim()) : undefined,
      vimeo_video_url: vimeoVideoUrl ? sanitizeInput(vimeoVideoUrl.trim()) : undefined,
      description: description ? sanitizeInput(description.trim()) : undefined,
      duration: duration ? sanitizeInput(duration.trim()) : undefined,
      period: period ? sanitizeInput(period.trim()) : undefined,
      target_group: targetGroup ? sanitizeInput(targetGroup.trim()) : undefined,
      lesson_type: lessonType ? sanitizeInput(lessonType.trim()) : undefined,
      publication_date: publicationDate ? publicationDate.trim() : undefined,
      published: formData.get('published') !== null 
        ? (formData.get('published') === 'true' || formData.get('published') === 'on')
        : undefined,
      rvp_connection: rvpConnection
        ? rvpConnection.split(',').map(s => sanitizeInput(s.trim())).filter(Boolean)
        : undefined,
      tag_ids: tagIds
        ? tagIds.split(',').map(s => s.trim()).filter(Boolean).filter(id => isValidUUID(id))
        : undefined,
    }

    const lesson = await updateLesson(lessonId, input)
    
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
    logger.error('Error deleting lesson', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při mazání lekce',
    }
  }
}

