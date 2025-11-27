'use server'

import { uploadImageToStorage } from '@/lib/supabase/storage'
import { logger } from '@/lib/logger'

export interface UploadImageResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Server action to upload an image file to Supabase Storage
 * @param formData - FormData containing the image file
 * @returns Upload result with URL or error
 */
export async function uploadImageAction(formData: FormData): Promise<UploadImageResult> {
  try {
    const file = formData.get('file') as File | null

    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image',
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image size must be less than 5MB',
      }
    }

    // Upload to Supabase Storage
    const url = await uploadImageToStorage(file, 'lesson-materials', 'images')

    return {
      success: true,
      url,
    }
  } catch (error) {
    logger.error('Error in uploadImageAction', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    }
  }
}

