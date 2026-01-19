'use client'

import * as React from 'react'
import { uploadImageToStorage, StorageUploadError, STORAGE_LIMITS } from '@/lib/supabase/storage'

interface ThumbnailUploadProps {
  value: string
  onChange: (url: string) => void
  className?: string
}

export function ThumbnailUpload({ value, onChange, className = '' }: ThumbnailUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [imageError, setImageError] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const validateImageDimensions = (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        const maxDimension = 4096
        if (img.width > maxDimension || img.height > maxDimension) {
          resolve({ 
            valid: false, 
            error: `Obrázek je příliš velký (${img.width}×${img.height}px). Maximum je ${maxDimension}×${maxDimension}px.`
          })
        } else {
          resolve({ valid: true })
        }
      }
      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        resolve({ valid: false, error: 'Nepodařilo se načíst obrázek pro validaci' })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFile = React.useCallback(async (file: File) => {
    // Validate file type
    if (!STORAGE_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type as typeof STORAGE_LIMITS.ALLOWED_IMAGE_TYPES[number])) {
      setError('Nepodporovaný formát. Povolené: JPEG, PNG, GIF, WebP, SVG.')
      return
    }

    // Validate file size
    if (file.size > STORAGE_LIMITS.MAX_FILE_SIZE) {
      setError(`Obrázek musí být menší než ${STORAGE_LIMITS.MAX_FILE_SIZE_DISPLAY}`)
      return
    }

    // Validate image dimensions
    const dimensionCheck = await validateImageDimensions(file)
    if (!dimensionCheck.valid) {
      setError(dimensionCheck.error || 'Neplatné rozměry obrázku')
      return
    }

    setError(null)
    setIsUploading(true)
    setImageError(false)

    try {
      // Direct client-side upload to Supabase Storage
      const url = await uploadImageToStorage(file, 'lesson-materials', 'thumbnails')

      if (url) {
        onChange(url)
      } else {
        setError('Nepodařilo se nahrát obrázek')
      }
    } catch (err) {
      // Use user-friendly message from StorageUploadError
      if (err instanceof StorageUploadError) {
        setError(err.userMessage)
      } else {
        setError('Nepodařilo se nahrát obrázek. Zkuste to prosím znovu.')
      }
    } finally {
      setIsUploading(false)
    }
  }, [onChange])

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setImageError(false)
    setError(null)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value && !imageError ? (
        // Preview mode
        <div className="relative group">
          <div className="relative w-[316px] h-[200px] rounded-xl overflow-hidden border border-grey-200 bg-grey-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Náhledový obrázek"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleClick}
                className="px-4 py-2 bg-white text-grey-900 text-sm font-medium rounded-lg hover:bg-grey-100 transition-colors"
              >
                Změnit
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Odebrat
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Upload mode
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-[316px] h-[200px] rounded-xl border-2 border-dashed
            flex flex-col items-center justify-center gap-3 cursor-pointer
            transition-colors
            ${isDragging 
              ? 'border-brand-primary bg-turquoise-50' 
              : 'border-grey-300 bg-grey-50 hover:border-grey-400 hover:bg-grey-100'
            }
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          {isUploading ? (
            <>
              <div className="w-10 h-10 border-[3px] border-grey-300 border-t-brand-primary rounded-full animate-spin" />
              <span className="text-sm text-text-subtle">Nahrávání...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-grey-200 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-grey-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-strong">
                  {isDragging ? 'Pusťte pro nahrání' : 'Přetáhněte obrázek'}
                </p>
                <p className="text-xs text-text-subtle mt-1">
                  nebo klikněte pro výběr • max {STORAGE_LIMITS.MAX_FILE_SIZE_DISPLAY}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {imageError && (
        <p className="mt-2 text-sm text-red-600">
          Obrázek se nepodařilo načíst. Zkuste nahrát jiný.
        </p>
      )}
    </div>
  )
}
