import { createClient } from './client'
import { logger } from '@/lib/logger'

// Storage limits (must match bucket configuration in migration)
export const STORAGE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE_DISPLAY: '5MB',
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  /** Image + PDF for additional activity attachments */
  ALLOWED_ACTIVITY_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
  ],
} as const

/**
 * Custom error class for storage upload errors with user-friendly messages
 */
export class StorageUploadError extends Error {
  public readonly userMessage: string
  public readonly originalError?: Error

  constructor(userMessage: string, originalError?: Error) {
    super(originalError?.message || userMessage)
    this.name = 'StorageUploadError'
    this.userMessage = userMessage
    this.originalError = originalError
  }
}

/**
 * Parse Supabase storage error and return user-friendly message
 */
function getUploadErrorMessage(error: { message?: string; statusCode?: string }): string {
  const message = error.message?.toLowerCase() || ''
  
  // File size exceeded
  if (message.includes('payload too large') || message.includes('file size') || message.includes('too large')) {
    return `Soubor je příliš velký. Maximální velikost je ${STORAGE_LIMITS.MAX_FILE_SIZE_DISPLAY}.`
  }
  
  // Invalid mime type
  if (message.includes('mime') || message.includes('type') || message.includes('not allowed')) {
    return 'Nepodporovaný formát souboru. Povolené formáty: JPEG, PNG, GIF, WebP, SVG, PDF.'
  }
  
  // Authentication error
  if (message.includes('auth') || message.includes('permission') || message.includes('policy')) {
    return 'Nemáte oprávnění nahrávat soubory. Přihlaste se prosím.'
  }
  
  // Bucket not found
  if (message.includes('bucket') || message.includes('not found')) {
    return 'Úložiště není dostupné. Zkuste to prosím později.'
  }
  
  // Generic error
  return 'Nepodařilo se nahrát soubor. Zkuste to prosím znovu.'
}

/**
 * Upload an image file to Supabase Storage (client-side)
 * @param file - File object to upload
 * @param bucket - Storage bucket name (default: 'lesson-materials')
 * @param folder - Optional folder path within the bucket
 * @returns Public URL of the uploaded file
 * @throws StorageUploadError with user-friendly message
 */
export async function uploadImageToStorage(
  file: File,
  bucket: string = 'lesson-materials',
  folder?: string
): Promise<string> {
  try {
    // Client-side validation (belt and suspenders with server-side bucket limits)
    if (file.size > STORAGE_LIMITS.MAX_FILE_SIZE) {
      throw new StorageUploadError(
        `Soubor je příliš velký (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximální velikost je ${STORAGE_LIMITS.MAX_FILE_SIZE_DISPLAY}.`
      )
    }
    
    if (!STORAGE_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type as typeof STORAGE_LIMITS.ALLOWED_IMAGE_TYPES[number])) {
      throw new StorageUploadError(
        'Nepodporovaný formát souboru. Povolené formáty: JPEG, PNG, GIF, WebP, SVG.'
      )
    }

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
      throw new StorageUploadError(getUploadErrorMessage(error), error as Error)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new StorageUploadError('Nepodařilo se získat URL nahraného souboru.')
    }

    return urlData.publicUrl
  } catch (error) {
    // Re-throw StorageUploadError as-is
    if (error instanceof StorageUploadError) {
      throw error
    }
    
    logger.error('Error in uploadImageToStorage', error)
    throw new StorageUploadError(
      'Nepodařilo se nahrát soubor. Zkuste to prosím znovu.',
      error as Error
    )
  }
}

/**
 * Upload an additional activity attachment (image or PDF) to Supabase Storage (client-side)
 * @param file - File object (image/* or application/pdf)
 * @param bucket - Storage bucket name (default: 'lesson-materials')
 * @param folder - Optional folder path (default: 'additional-activities')
 * @returns Public URL of the uploaded file
 * @throws StorageUploadError with user-friendly message
 */
export async function uploadActivityFileToStorage(
  file: File,
  bucket: string = 'lesson-materials',
  folder: string = 'additional-activities'
): Promise<string> {
  try {
    if (file.size > STORAGE_LIMITS.MAX_FILE_SIZE) {
      throw new StorageUploadError(
        `Soubor je příliš velký (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximální velikost je ${STORAGE_LIMITS.MAX_FILE_SIZE_DISPLAY}.`
      )
    }

    const allowed = STORAGE_LIMITS.ALLOWED_ACTIVITY_FILE_TYPES as readonly string[]
    if (!allowed.includes(file.type)) {
      throw new StorageUploadError(
        'Nepodporovaný formát souboru. Povolené formáty: JPEG, PNG, GIF, WebP, SVG, PDF.'
      )
    }

    const supabase = createClient()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop() || (file.type === 'application/pdf' ? 'pdf' : 'jpg')
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      logger.error('Error uploading activity file to storage', error)
      throw new StorageUploadError(getUploadErrorMessage(error), error as Error)
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
    if (!urlData?.publicUrl) {
      throw new StorageUploadError('Nepodařilo se získat URL nahraného souboru.')
    }
    return urlData.publicUrl
  } catch (error) {
    if (error instanceof StorageUploadError) throw error
    logger.error('Error in uploadActivityFileToStorage', error)
    throw new StorageUploadError(
      'Nepodařilo se nahrát soubor. Zkuste to prosím znovu.',
      error as Error
    )
  }
}

/**
 * Delete an image from Supabase Storage (client-side)
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
