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

export async function createLessonAction(formData: FormData) {
  try {
    const input: CreateLessonInput = {
      title: formData.get('title') as string,
      vimeo_video_url: formData.get('vimeo_video_url') as string || undefined,
      description: formData.get('description') as string || undefined,
      duration: formData.get('duration') as string || undefined,
      period: formData.get('period') as string || undefined,
      target_group: formData.get('target_group') as string || undefined,
      lesson_type: formData.get('lesson_type') as string || undefined,
      publication_date: formData.get('publication_date') as string || undefined,
      published: formData.get('published') === 'true' || formData.get('published') === 'on',
      rvp_connection: formData.get('rvp_connection') 
        ? (formData.get('rvp_connection') as string).split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      tag_ids: formData.get('tag_ids')
        ? (formData.get('tag_ids') as string).split(',').filter(Boolean)
        : undefined,
    }

    if (!input.title) {
      return {
        success: false,
        error: 'Název lekce je povinný',
      }
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
    const input: UpdateLessonInput = {
      title: formData.get('title') as string || undefined,
      vimeo_video_url: formData.get('vimeo_video_url') as string || undefined,
      description: formData.get('description') as string || undefined,
      duration: formData.get('duration') as string || undefined,
      period: formData.get('period') as string || undefined,
      target_group: formData.get('target_group') as string || undefined,
      lesson_type: formData.get('lesson_type') as string || undefined,
      publication_date: formData.get('publication_date') as string || undefined,
      published: formData.get('published') !== null 
        ? (formData.get('published') === 'true' || formData.get('published') === 'on')
        : undefined,
      rvp_connection: formData.get('rvp_connection')
        ? (formData.get('rvp_connection') as string).split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      tag_ids: formData.get('tag_ids')
        ? (formData.get('tag_ids') as string).split(',').filter(Boolean)
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

