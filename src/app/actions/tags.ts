'use server'

import { revalidatePath } from 'next/cache'
import {
  createTag,
  updateTag,
  deleteTag,
} from '@/lib/supabase/tags'
import { logger } from '@/lib/logger'

export async function createTagAction(title: string) {
  try {
    if (!title || !title.trim()) {
      return {
        success: false,
        error: 'Název tagu je povinný',
      }
    }

    const tag = await createTag(title.trim())
    
    revalidatePath('/lessons')
    revalidatePath('/lessons/new')
    
    return {
      success: true,
      data: tag,
    }
  } catch (error) {
    logger.error('Error creating tag', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při vytváření tagu',
    }
  }
}

export async function updateTagAction(tagId: string, title: string) {
  try {
    if (!title || !title.trim()) {
      return {
        success: false,
        error: 'Název tagu je povinný',
      }
    }

    const tag = await updateTag(tagId, title.trim())
    
    revalidatePath('/lessons')
    
    return {
      success: true,
      data: tag,
    }
  } catch (error) {
    logger.error('Error updating tag', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při aktualizaci tagu',
    }
  }
}

export async function deleteTagAction(tagId: string) {
  try {
    await deleteTag(tagId)
    
    revalidatePath('/lessons')
    
    return {
      success: true,
    }
  } catch (error) {
    logger.error('Error deleting tag', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při mazání tagu',
    }
  }
}
