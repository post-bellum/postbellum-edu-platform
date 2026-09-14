'use client'

import * as React from 'react'
import { useActionState } from 'react'
import {
  createLessonMaterialAction,
  updateLessonMaterialAction,
} from '@/app/actions/lesson-materials'
import {
  uploadEmbeddedImages,
  uploadMaterialPdfToStorage,
  deleteImageFromStorage,
  extractFilePathFromUrl,
  StorageUploadError,
  STORAGE_LIMITS,
} from '@/lib/supabase/storage'
import { FileText } from '@/components/icons'
import { logger } from '@/lib/logger'
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
  const [pdfUrl, setPdfUrl] = React.useState(material?.pdf_url || '')
  const [pdfFileName, setPdfFileName] = React.useState(material?.pdf_file_name || '')
  const [isUploadingPdf, setIsUploadingPdf] = React.useState(false)
  const [pdfError, setPdfError] = React.useState<string | null>(null)
  const pdfInputRef = React.useRef<HTMLInputElement>(null)
  const pdfInputId = React.useId()
  // PDFs that were displaced (replaced or removed) during this session and are
  // no longer referenced by the form. Purged from storage only once the form is
  // closed, so a cancelled edit never leaves the database pointing at a deleted
  // file - see `purgeUnreferencedPdfs`.
  const orphanedPdfUrls = React.useRef<string[]>([])
  // The PDF the database currently points at. Anything else uploaded in this
  // session is garbage the moment the form closes without saving.
  const persistedPdfUrl = React.useRef(material?.pdf_url || '')
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
      setPdfUrl(material?.pdf_url || '')
      setPdfFileName(material?.pdf_file_name || '')
      setPdfError(null)
      orphanedPdfUrls.current = []
      persistedPdfUrl.current = material?.pdf_url || ''
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

  /**
   * Delete every uploaded PDF the database does not point at.
   *
   * `keptUrl` is the URL that survives: the freshly saved one after a
   * successful submit, or the previously persisted one when the form is
   * cancelled. Everything else was uploaded straight from the browser and would
   * otherwise sit in the bucket forever, unreferenced.
   */
  const purgeUnreferencedPdfs = React.useCallback((keptUrl: string) => {
    const orphans = orphanedPdfUrls.current
    orphanedPdfUrls.current = []
    const unique = new Set(orphans.filter((url) => url && url !== keptUrl))
    unique.forEach((url) => {
      const path = extractFilePathFromUrl(url)
      if (path) {
        deleteImageFromStorage(path).catch((err) => {
          logger.error('[LessonMaterialForm] failed to delete orphaned PDF:', err)
        })
      }
    })
  }, [])

  React.useEffect(() => {
    if (state?.success) {
      // The submitted PDF is now the persisted one, so a later close must not
      // treat it as garbage.
      persistedPdfUrl.current = pdfUrl
      purgeUnreferencedPdfs(pdfUrl)
      onOpenChange(false)
      onSuccess?.()
    }
  }, [state, pdfUrl, purgeUnreferencedPdfs, onOpenChange, onSuccess])

  /**
   * Close without saving: the database still points at `persistedPdfUrl`, so
   * the PDF currently shown in the form is garbage too unless it is that one.
   */
  const handleCancel = React.useCallback(() => {
    // Closing mid-upload would let the in-flight file land in the bucket after
    // the purge has already run, leaking it. The upload takes a moment, so we
    // ignore the close request rather than track the request to cancel it.
    if (isUploadingPdf) return
    if (pdfUrl && pdfUrl !== persistedPdfUrl.current) {
      orphanedPdfUrls.current.push(pdfUrl)
    }
    purgeUnreferencedPdfs(persistedPdfUrl.current)
    onOpenChange(false)
  }, [isUploadingPdf, pdfUrl, purgeUnreferencedPdfs, onOpenChange])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      handleCancel()
    },
    [handleCancel, onOpenChange]
  )

  // next.config.ts sets bodySizeLimit to 5mb, but Vercel's hard platform
  // ceiling for serverless functions is ~4.5MB regardless of Next.js config.
  // We guard at 4MB to leave headroom for other fields and HTTP overhead.
  const MAX_CONTENT_BYTES = 4_000_000

  const handlePdfFile = React.useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setPdfError('Nahrát lze pouze soubor ve formátu PDF.')
      return
    }
    if (file.size > STORAGE_LIMITS.MAX_MATERIAL_PDF_SIZE) {
      setPdfError(`Soubor musí být menší než ${STORAGE_LIMITS.MAX_MATERIAL_PDF_SIZE_DISPLAY}`)
      return
    }
    setPdfError(null)
    setIsUploadingPdf(true)
    try {
      const url = await uploadMaterialPdfToStorage(file)
      setPdfUrl((previous) => {
        if (previous) orphanedPdfUrls.current.push(previous)
        return url
      })
      setPdfFileName(file.name)
    } catch (err) {
      setPdfError(
        err instanceof StorageUploadError ? err.userMessage : 'Nepodařilo se nahrát PDF.'
      )
    } finally {
      setIsUploadingPdf(false)
    }
  }, [])

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handlePdfFile(file)
    e.target.value = ''
  }

  // Plate's DnD plugin mounts react-dnd's HTML5Backend, which listens for
  // `dragover` on window and sets `dropEffect = 'none'` for drags that hit none
  // of its drop targets — the browser then refuses the drop. Our handlers run
  // after that window listener, so we set the effect back to 'copy'.
  const allowPdfDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // `files` can come back empty in Safari once another dragover handler has
    // consumed the transfer; `items` still yields the file.
    const file =
      e.dataTransfer.files?.[0] ??
      Array.from(e.dataTransfer.items ?? [])
        .find((item) => item.kind === 'file')
        ?.getAsFile()
    if (file) {
      handlePdfFile(file)
    } else {
      setPdfError('Soubor se nepodařilo přečíst. Vyberte ho prosím kliknutím.')
    }
  }

  const handlePdfRemove = () => {
    if (pdfUrl) orphanedPdfUrls.current.push(pdfUrl)
    setPdfUrl('')
    setPdfFileName('')
    setPdfError(null)
  }

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
      formData.set('pdf_url', pdfUrl)
      formData.set('pdf_file_name', pdfUrl ? pdfFileName : '')
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <Label htmlFor={pdfInputId}>PDF ke stažení</Label>
            <p className="text-xs text-gray-500">
              Napojeno na tlačítko „Stáhnout“. Bez nahraného PDF se soubor vygeneruje
              z obsahu editoru jako dosud.
            </p>
            {/* The data-*-ignore attributes keep password-manager autofill away
                from these fields; their overlay scanner throws on inputs with a
                null autocomplete type and Next.js then shows its error overlay. */}
            <input
              id={pdfInputId}
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              onChange={handlePdfSelect}
              className="sr-only"
              aria-label="Vybrat PDF soubor"
              autoComplete="off"
              data-1p-ignore=""
              data-lpignore="true"
              data-bwignore=""
              data-form-type="other"
            />
            {pdfUrl ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:underline truncate block"
                      title={pdfFileName || pdfUrl}
                    >
                      {pdfFileName || 'PDF soubor'}
                    </a>
                    <p className="text-sm text-gray-500">Otevřít v novém okně</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isUploadingPdf}
                    >
                      Nahradit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePdfRemove}
                      disabled={isUploadingPdf}
                    >
                      Odebrat
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <label
                htmlFor={pdfInputId}
                onDragEnter={allowPdfDrag}
                onDragOver={allowPdfDrag}
                onDrop={handlePdfDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors flex flex-col items-center justify-center gap-2 min-h-[140px]
                  ${isUploadingPdf ? 'opacity-60 pointer-events-none' : 'hover:border-gray-400 hover:bg-gray-50'}
                  border-gray-300 bg-gray-50
                `}
              >
                {isUploadingPdf ? (
                  <>
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    <span className="text-sm text-gray-600">Nahrávání...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Přetáhněte PDF nebo klikněte pro výběr
                    </p>
                    <p className="text-xs text-gray-500">
                      Pouze PDF • max {STORAGE_LIMITS.MAX_MATERIAL_PDF_SIZE_DISPLAY}
                    </p>
                  </>
                )}
              </label>
            )}
            {pdfError && <p className="text-sm text-red-600">{pdfError}</p>}
          </div>

          <input
            type="hidden"
            name="pdf_url"
            value={pdfUrl}
            autoComplete="off"
            data-1p-ignore=""
            data-lpignore="true"
            data-bwignore=""
          />
          <input
            type="hidden"
            name="pdf_file_name"
            value={pdfUrl ? pdfFileName : ''}
            autoComplete="off"
            data-1p-ignore=""
            data-lpignore="true"
            data-bwignore=""
          />

          <div className="space-y-2">
            <Label htmlFor="content">Obsah (editor)</Label>
            <p className="text-xs text-gray-500">
              Napojeno na tlačítko „Upravit“ — text, který si učitel zkopíruje
              a upraví. Může se lišit od nahraného PDF.
            </p>
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
              toolbarClassName="top-0"
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
              onClick={handleCancel}
              disabled={isUploadingPdf}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={isProcessingImages || isUploadingPdf}>
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


