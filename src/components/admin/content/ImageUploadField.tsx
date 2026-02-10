'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import { logger } from '@/lib/logger'

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  label: string
  folder?: string
  previewWidth?: number
  previewHeight?: number
}

export function ImageUploadField({
  value,
  onChange,
  label,
  folder = 'general',
  previewWidth = 120,
  previewHeight = 80,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const url = await uploadImageToStorage(file, 'page-content', folder)
      onChange(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chyba pri nahravani'
      setError(message)
      logger.error('Error uploading page content image', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-grey-700">{label}</label>
      <div className="flex items-center gap-3">
        {value && (
          <div className="relative shrink-0 border border-grey-200 rounded-lg overflow-hidden bg-grey-50">
            <Image
              src={value}
              alt={label}
              width={previewWidth}
              height={previewHeight}
              className="object-contain"
              style={{ width: previewWidth, height: previewHeight }}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 p-0.5 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
              title="Odstranit"
            >
              <X className="w-3 h-3 text-red-500" />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-grey-200 rounded-lg hover:bg-grey-50 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Nahravam...' : value ? 'Zmenit' : 'Nahrat'}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="nebo zadejte URL"
          className="mt-1 px-3 py-1.5 text-xs border border-grey-200 rounded-lg font-mono text-grey-600"
        />
      )}
    </div>
  )
}
