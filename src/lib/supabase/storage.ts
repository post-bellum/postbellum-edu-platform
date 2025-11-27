import { createClient } from './client'
import { logger } from '@/lib/logger'

/**
 * Upload an image file to Supabase Storage
 * @param file - File object to upload
 * @param bucket - Storage bucket name (default: 'lesson-materials')
 * @param folder - Optional folder path within the bucket
 * @returns Public URL of the uploaded file
 */
export async function uploadImageToStorage(
  file: File,
  bucket: string = 'lesson-materials',
  folder?: string
): Promise<string> {
  try {
    const supabase = createClient()
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload file
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      logger.error('Error uploading image to storage', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image')
    }

    return urlData.publicUrl
  } catch (error) {
    logger.error('Error in uploadImageToStorage', error)
    throw error
  }
}

/**
 * Delete an image from Supabase Storage
 * @param filePath - Path to the file in storage
 * @param bucket - Storage bucket name (default: 'lesson-materials')
 */
export async function deleteImageFromStorage(
  filePath: string,
  bucket: string = 'lesson-materials'
): Promise<void> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      logger.error('Error deleting image from storage', error)
      throw new Error(`Failed to delete image: ${error.message}`)
    }
  } catch (error) {
    logger.error('Error in deleteImageFromStorage', error)
    throw error
  }
}

/**
 * Extract file path from Supabase storage URL
 * @param url - Full storage URL
 * @param bucket - Storage bucket name
 * @returns File path within the bucket
 */
export function extractFilePathFromUrl(url: string, bucket: string = 'lesson-materials'): string | null {
  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(new RegExp(`/${bucket}/(.+)`))
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}

