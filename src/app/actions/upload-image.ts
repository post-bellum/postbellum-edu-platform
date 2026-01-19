'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export interface UploadImageResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Server action to upload an image file to Supabase Storage
 * Uses server client with authenticated user session for RLS policies
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

    // Upload to Supabase Storage using server client (authenticated)
    const supabase = await createClient()
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `images/${fileName}`

    // Upload file
    const { error } = await supabase.storage
      .from('lesson-materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      logger.error('Error uploading image to storage', error)
      return {
        success: false,
        error: `Failed to upload image: ${error.message}`,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lesson-materials')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: 'Failed to get public URL for uploaded image',
      }
    }

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    logger.error('Error in uploadImageAction', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    }
  }
}
