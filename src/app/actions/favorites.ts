'use server'

import { revalidatePath } from 'next/cache'
import {
  addFavorite,
  removeFavorite,
  toggleFavorite,
} from '@/lib/supabase/favorites'
import { logger } from '@/lib/logger'

export async function addFavoriteAction(lessonId: string) {
  try {
    await addFavorite(lessonId)
    
    revalidatePath(`/lessons/${lessonId}`)
    revalidatePath('/lessons')
    
    return {
      success: true,
    }
  } catch (error) {
    logger.error('Error adding favorite', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při přidávání do oblíbených',
    }
  }
}

export async function removeFavoriteAction(lessonId: string) {
  try {
    await removeFavorite(lessonId)
    
    revalidatePath(`/lessons/${lessonId}`)
    revalidatePath('/lessons')
    
    return {
      success: true,
    }
  } catch (error) {
    logger.error('Error removing favorite', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při odebírání z oblíbených',
    }
  }
}

export async function toggleFavoriteAction(lessonId: string) {
  try {
    const isFavorited = await toggleFavorite(lessonId)
    
    revalidatePath(`/lessons/${lessonId}`)
    revalidatePath('/lessons')
    
    return {
      success: true,
      isFavorited,
    }
  } catch (error) {
    logger.error('Error toggling favorite', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při změně oblíbených',
    }
  }
}

