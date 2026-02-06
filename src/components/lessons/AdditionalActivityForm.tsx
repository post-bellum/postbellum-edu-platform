'use client'

import * as React from 'react'
import { useActionState } from 'react'
import {
  createAdditionalActivityAction,
  updateAdditionalActivityAction,
} from '@/app/actions/additional-activities'
import type { AdditionalActivity, AdditionalActivityAttachmentType } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { uploadActivityFileToStorage, StorageUploadError, STORAGE_LIMITS } from '@/lib/supabase/storage'
import { FileText, ImageIcon } from 'lucide-react'

interface AdditionalActivityFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonId: string
  activity?: AdditionalActivity
  onSuccess?: () => void
}

export function AdditionalActivityForm({
  open,
  onOpenChange,
  lessonId,
  activity,
  onSuccess,
}: AdditionalActivityFormProps) {
  const isEditing = !!activity

  const [title, setTitle] = React.useState(activity?.title || '')
  const [description, setDescription] = React.useState(activity?.description || '')
  const [imageUrl, setImageUrl] = React.useState(activity?.image_url || '')
  const [attachmentType, setAttachmentType] = React.useState<AdditionalActivityAttachmentType | ''>(
    activity?.attachment_type === 'pdf' ? 'pdf' : 'image'
  )
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Reset form when modal opens/closes or activity changes
  React.useEffect(() => {
    if (open) {
      setTitle(activity?.title || '')
      setDescription(activity?.description || '')
      setImageUrl(activity?.image_url || '')
      setAttachmentType(activity?.attachment_type === 'pdf' ? 'pdf' : 'image')
      setUploadError(null)
    }
  }, [open, activity])

  const action = isEditing
    ? async (_prevState: unknown, formData: FormData) => {
        return updateAdditionalActivityAction(activity.id, formData)
      }
    : async (_prevState: unknown, formData: FormData) => {
        return createAdditionalActivityAction(formData)
      }

  const [state, formAction] = useActionState(action, null)

  React.useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }, [state, onOpenChange, onSuccess])

  const handleFile = React.useCallback(async (file: File) => {
    const allowed = STORAGE_LIMITS.ALLOWED_ACTIVITY_FILE_TYPES as readonly string[]
    if (!allowed.includes(file.type)) {
      setUploadError('Povolené formáty: JPEG, PNG, GIF, WebP, SVG, PDF.')
      return
    }
    if (file.size > STORAGE_LIMITS.MAX_FILE_SIZE) {
      setUploadError(`Soubor musí být menší než ${STORAGE_LIMITS.MAX_FILE_SIZE_DISPLAY}`)
      return
    }
    setUploadError(null)
    setIsUploading(true)
    try {
      const url = await uploadActivityFileToStorage(file)
      setImageUrl(url)
      setAttachmentType(file.type === 'application/pdf' ? 'pdf' : 'image')
    } catch (err) {
      setUploadError(err instanceof StorageUploadError ? err.userMessage : 'Nepodařilo se nahrát soubor.')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }
  const handleRemoveAttachment = () => {
    setImageUrl('')
    setAttachmentType('image')
    setUploadError(null)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('lesson_id', lessonId)
    formData.set('title', title)
    formData.set('description', description)
    formData.set('image_url', imageUrl)
    formData.set('attachment_type', attachmentType || 'image')
    React.startTransition(() => {
      formAction(formData)
    })
  }

  const isPdf = attachmentType === 'pdf'

  const displayFileName = imageUrl
    ? imageUrl.split('/').filter(Boolean).pop() ?? imageUrl
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[672px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Upravit aktivitu' : 'Nová aktivita'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Upravte informace o doplňkové aktivitě'
              : 'Přidejte novou doplňkovou aktivitu k lekci'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Název *</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="např. Kahoot! Kvíz na zopakování pojmů"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis (markdown)</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Popis aktivity v markdown formátu..."
            />
          </div>

          <div className="space-y-2">
            <Label>Příloha (obrázek, QR kód nebo PDF)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            {imageUrl ? (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                {isPdf ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">PDF soubor</p>
                      <p className="text-sm text-gray-500 truncate" title={displayFileName}>
                        {displayFileName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        Nahradit
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleRemoveAttachment}>
                        Odebrat
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Náhled"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">Obrázek</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        Nahradit
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleRemoveAttachment}>
                        Odebrat
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors flex flex-col items-center justify-center gap-2 min-h-[140px]
                  ${isUploading ? 'opacity-60 pointer-events-none' : 'hover:border-gray-400 hover:bg-gray-50'}
                  border-gray-300 bg-gray-50
                `}
              >
                {isUploading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    <span className="text-sm text-gray-600">Nahrávání...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Přetáhněte soubor nebo klikněte pro výběr
                    </p>
                    <p className="text-xs text-gray-500">
                      Obrázek (JPEG, PNG, GIF, WebP, SVG) nebo PDF • max {STORAGE_LIMITS.MAX_FILE_SIZE_DISPLAY}
                    </p>
                  </>
                )}
              </div>
            )}
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          </div>

          <input type="hidden" name="image_url" value={imageUrl} />
          <input type="hidden" name="attachment_type" value={attachmentType || 'image'} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Zrušit
            </Button>
            <Button type="submit">
              {isEditing ? 'Uložit změny' : 'Vytvořit aktivitu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
