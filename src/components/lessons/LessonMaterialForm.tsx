'use client'

import * as React from 'react'
import { useActionState } from 'react'
import {
  createLessonMaterialAction,
  updateLessonMaterialAction,
} from '@/app/actions/lesson-materials'
import { uploadEmbeddedImages } from '@/lib/supabase/storage'
import type {
  LessonMaterial,
  LessonSpecification,
} from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { PlateEditor } from '@/components/editor/PlateEditor'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

interface LessonMaterialFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonId: string
  material?: LessonMaterial
  onSuccess?: () => void
}

export function LessonMaterialForm({
  open,
  onOpenChange,
  lessonId,
  material,
  onSuccess,
}: LessonMaterialFormProps) {
  const isEditing = !!material

  const [title, setTitle] = React.useState(material?.title || '')
  const [description, setDescription] = React.useState(material?.description || '')
  const [content, setContent] = React.useState(material?.content || '')
  const [specification, setSpecification] = React.useState<LessonSpecification | ''>(
    material?.specification || ''
  )
  const [duration, setDuration] = React.useState<string>(
    material?.duration?.toString() || ''
  )
  // Key to reset the rich text editor when form resets
  const [editorResetKey, setEditorResetKey] = React.useState(0)
  const [fieldErrors, setFieldErrors] = React.useState<{
    title?: string
    specification?: string
    duration?: string
    content?: string
  }>({})
  const [isProcessingImages, setIsProcessingImages] = React.useState(false)

  // Reset form when modal opens/closes or material changes
  React.useEffect(() => {
    if (open) {
      const c = material?.content || ''
      setTitle(material?.title || '')
      setDescription(material?.description || '')
      setContent(c)
      setSpecification(material?.specification || '')
      setDuration(material?.duration?.toString() || '')
      setEditorResetKey(prev => prev + 1)
      setFieldErrors({})
    }
  }, [open, material])

  const action = isEditing
    ? async (_prevState: unknown, formData: FormData) => {
        return updateLessonMaterialAction(material.id, formData)
      }
    : async (_prevState: unknown, formData: FormData) => {
        return createLessonMaterialAction(formData)
      }

  const [state, formAction] = useActionState(action, null)

  React.useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }, [state, onOpenChange, onSuccess])

  // next.config.ts sets bodySizeLimit to 5mb, but Vercel's hard platform
  // ceiling for serverless functions is ~4.5MB regardless of Next.js config.
  // We guard at 4MB to leave headroom for other fields and HTTP overhead.
  const MAX_CONTENT_BYTES = 4_000_000

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Capture before any await — React clears e.currentTarget once the
    // synchronous event handler returns, so it would be null after an await.
    const formElement = e.currentTarget

    // Sync field validation first (instant feedback, no async needed)
    const errors: typeof fieldErrors = {}
    if (!title.trim()) errors.title = 'Vyplňte název materiálu'
    if (!specification) errors.specification = 'Vyberte cílovou skupinu'
    if (!duration) errors.duration = 'Vyberte délku materiálu'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsProcessingImages(true)

    try {
      // Upload any base64 images left in the HTML by Word/Google Docs paste.
      // The ImagePlugin's uploadImage callback only fires for direct image-file
      // pastes; images embedded in pasted HTML bypass it entirely and land as
      // data: URLs in the content. We catch them here before submission.
      const processedContent = await uploadEmbeddedImages(content)

      // Size guard after image processing (base64 → URLs shrinks the payload)
      const contentBytes = new TextEncoder().encode(processedContent).length
      if (contentBytes > MAX_CONTENT_BYTES) {
        const kb = Math.round(contentBytes / 1024)
        const maxKb = Math.round(MAX_CONTENT_BYTES / 1024)
        setFieldErrors({
          content: `Obsah je příliš velký (${kb} KB). Maximální povolená velikost je ${maxKb} KB. Zkraťte nebo zjednodušte obsah materiálu.`,
        })
        return
      }

      const formData = new FormData(formElement)
      formData.set('lesson_id', lessonId)
      formData.set('title', title)
      formData.set('description', description)
      formData.set('content', processedContent)
      formData.set('specification', specification)
      formData.set('duration', duration)
      React.startTransition(() => { formAction(formData) })
    } catch (err) {
      console.error('[LessonMaterialForm] handleSubmit error:', err)
      setFieldErrors({
        content: 'Nepodařilo se zpracovat obrázky v obsahu. Zkuste to prosím znovu.',
      })
    } finally {
      setIsProcessingImages(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1152px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Upravit materiál' : 'Nový materiál'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Upravte informace o materiálu k lekci'
              : 'Přidejte nový materiál k lekci'}
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
              onChange={(e) => {
                setTitle(e.target.value)
                if (fieldErrors.title) {
                  setFieldErrors((prev) => ({ ...prev, title: undefined }))
                }
              }}
              placeholder="např. Pracovní list, Metodický list"
            />
            {fieldErrors.title && (
              <p className="text-sm text-red-600">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis (markdown)</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Obsahuje:&#10;- Bod 1&#10;- Bod 2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Obsah</Label>
            <PlateEditor
              content={content}
              onChange={(val) => {
                setContent(val)
                if (fieldErrors.content) {
                  setFieldErrors((prev) => ({ ...prev, content: undefined }))
                }
              }}
              placeholder="Začněte psát obsah materiálu... Můžete kopírovat z Wordu nebo Google Docs."
              resetKey={editorResetKey}
            />
            {/* Hidden input for form submission */}
            <input type="hidden" name="content" value={content} />
            {fieldErrors.content && (
              <p className="text-sm text-red-600">{fieldErrors.content}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specification">Cílová skupina *</Label>
              <Select
                value={specification}
                onValueChange={(value) => {
                  setSpecification(value as LessonSpecification)
                  if (fieldErrors.specification) {
                    setFieldErrors((prev) => ({ ...prev, specification: undefined }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte skupinu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2nd_grade_elementary">
                    2. stupeň ZŠ
                  </SelectItem>
                  <SelectItem value="high_school">Střední školy</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.specification && (
                <p className="text-sm text-red-600">{fieldErrors.specification}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Délka (minuty) *</Label>
              <Select
                value={duration}
                onValueChange={(value) => {
                  setDuration(value)
                  if (fieldErrors.duration) {
                    setFieldErrors((prev) => ({ ...prev, duration: undefined }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte délku" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">20 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.duration && (
                <p className="text-sm text-red-600">{fieldErrors.duration}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={isProcessingImages}>
              {isProcessingImages
                ? 'Nahrávání obrázků…'
                : isEditing ? 'Uložit změny' : 'Vytvořit materiál'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


