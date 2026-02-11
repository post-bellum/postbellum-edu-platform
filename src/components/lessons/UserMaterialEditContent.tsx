'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Eye, Trash2, Check, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FeedbackModal } from '@/components/ui/FeedbackModal'
import { PlateEditor } from '@/components/editor/PlateEditor'
import { LessonMaterialViewModal } from './LessonMaterialViewModal'
import { MaterialEditSidebar } from './MaterialEditSidebar'
import { Breadcrumbs } from './Breadcrumbs'
import {
  updateUserLessonMaterialAction,
  deleteUserLessonMaterialAction,
} from '@/app/actions/user-lesson-materials'
import type { UserLessonMaterial, LessonWithRelations } from '@/types/lesson.types'
import { exportToPDF } from '@/lib/utils/pdf-export'
import { logger } from '@/lib/logger'
import { generateLessonUrlFromLesson } from '@/lib/utils'

interface UserMaterialEditContentProps {
  material: UserLessonMaterial
  lesson: LessonWithRelations
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// Auto-save configuration
const AUTO_SAVE_DELAY_MS = 1000

export function UserMaterialEditContent({
  material: initialMaterial,
  lesson,
}: UserMaterialEditContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isFromProfile = searchParams.get('from') === 'profile'
  
  const lessonUrl = generateLessonUrlFromLesson(lesson)
  const profileMaterialsUrl = '/profile?tab=materials'
  
  const [title, setTitle] = React.useState(initialMaterial.title)
  const [content, setContent] = React.useState(initialMaterial.content || '')
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>('idle')
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isExportingPDF, setIsExportingPDF] = React.useState(false)
  const [exportError, setExportError] = React.useState<string | null>(null)
  const [feedbackModal, setFeedbackModal] = React.useState<{
    open: boolean
    type: 'success' | 'error'
    title: string
    message?: string
  }>({
    open: false,
    type: 'error',
    title: '',
  })

  // Debounced auto-save
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const pendingSaveRef = React.useRef<Promise<void> | null>(null)
  const queuedSaveRef = React.useRef(false)
  const lastSavedRef = React.useRef({ title: initialMaterial.title, content: initialMaterial.content || '' })
  const latestDraftRef = React.useRef({ title: initialMaterial.title, content: initialMaterial.content || '' })
  const isDeletedRef = React.useRef(false) // Flag to prevent auto-save after deletion

  const saveChanges = React.useCallback(async (newTitle: string, newContent: string) => {
    // Skip if material was deleted
    if (isDeletedRef.current) {
      return
    }

    // Skip if nothing changed
    if (newTitle === lastSavedRef.current.title && newContent === lastSavedRef.current.content) {
      return
    }

    setSaveStatus('saving')
    setSaveError(null)

    try {
      const formData = new FormData()
      formData.set('title', newTitle)
      formData.set('content', newContent)

      const result = await updateUserLessonMaterialAction(initialMaterial.id, formData)

      // Check again if material was deleted during the request
      if (isDeletedRef.current) {
        return
      }

      if (result.success) {
        setSaveStatus('saved')
        lastSavedRef.current = { title: newTitle, content: newContent }
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        setSaveError(result.error || 'Neznámá chyba')
      }
    } catch (error) {
      if (isDeletedRef.current) return
      setSaveStatus('error')
      const message = error instanceof Error ? error.message : String(error)
      // Detect body size limit errors
      if (message.includes('Body exceeded') || message.includes('body size')) {
        setSaveError('Obsah je příliš velký. Zkuste zmenšit obrázky nebo zkrátit text.')
      } else {
        setSaveError(message || 'Neznámá chyba při ukládání')
      }
    }
  }, [initialMaterial.id])

  // Ensures only one request is in flight; new changes queue another save
  const attemptSave = React.useCallback(function runSave() {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    // If a save is already running, queue another run with the latest draft
    if (pendingSaveRef.current) {
      queuedSaveRef.current = true
      return pendingSaveRef.current
    }

    const { title: draftTitle, content: draftContent } = latestDraftRef.current

    // Nothing to save
    if (draftTitle === lastSavedRef.current.title && draftContent === lastSavedRef.current.content) {
      return Promise.resolve()
    }

    const promise = saveChanges(draftTitle, draftContent).finally(() => {
      pendingSaveRef.current = null

      // If changes happened during the previous request, save again with the newest draft
      if (queuedSaveRef.current) {
        queuedSaveRef.current = false
        if (
          latestDraftRef.current.title !== lastSavedRef.current.title ||
          latestDraftRef.current.content !== lastSavedRef.current.content
        ) {
          void runSave()
        }
      }
    })

    pendingSaveRef.current = promise
    return promise
  }, [saveChanges])

  const scheduleSave = React.useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      void attemptSave()
    }, AUTO_SAVE_DELAY_MS)
  }, [attemptSave])

  const flushPendingSave = React.useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    return attemptSave()
  }, [attemptSave])

  // Auto-save on title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    latestDraftRef.current = { ...latestDraftRef.current, title: newTitle }
    scheduleSave()
  }

  // Auto-save on content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    latestDraftRef.current = { ...latestDraftRef.current, content: newContent }
    scheduleSave()
  }

  // Cleanup and save on unmount if there are unsaved changes
  React.useEffect(() => {
    return () => {
      // Cancel any pending saves if material was deleted
      if (isDeletedRef.current) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
          saveTimeoutRef.current = null
        }
        return
      }
      // Flush any debounced save before unmount; fire-and-forget the promise
      void flushPendingSave()
    }
  }, [flushPendingSave])

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    
    // Mark as deleted to prevent any pending auto-save requests
    isDeletedRef.current = true
    
    // Cancel any pending auto-save requests
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    
    // Navigate immediately to prevent page re-render from trying to fetch deleted material
    const targetUrl = isFromProfile ? profileMaterialsUrl : lessonUrl
    router.replace(targetUrl)
    
    try {
      const result = await deleteUserLessonMaterialAction(initialMaterial.id, lesson.id)

      if (!result.success) {
        setFeedbackModal({
          open: true,
          type: 'error',
          title: 'Chyba',
          message: result.error || 'Nepodařilo se smazat materiál',
        })
      }
    } catch {
      setFeedbackModal({
        open: true,
        type: 'error',
        title: 'Chyba',
        message: 'Nepodařilo se smazat materiál',
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleExportPDF = React.useCallback(async () => {
    if (!content) return

    setIsExportingPDF(true)
    setExportError(null)

    try {
      await exportToPDF(title, content)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Chyba při exportu do PDF'
      setExportError(errorMsg)
      logger.error('PDF export error', err)
    } finally {
      setIsExportingPDF(false)
    }
  }, [title, content])

  const getSaveStatusDisplay = () => {
    if (isExportingPDF) {
      return (
        <span className="flex items-center gap-1 text-gray-500 text-sm">
          Exportuji...
        </span>
      )
    }
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="flex items-center gap-1 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Ukládám...
          </span>
        )
      case 'saved':
        return (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <Check className="w-4 h-4" />
            Uloženo automaticky
          </span>
        )
      case 'error':
        return (
          <span className="text-red-600 text-sm" title={saveError || undefined}>
            Chyba při ukládání{saveError ? `: ${saveError}` : ''}
          </span>
        )
      default:
        return null
    }
  }

  const breadcrumbItems = isFromProfile
    ? [
        { label: 'Domov', href: '/' },
        { label: 'Profil', href: '/profile' },
        { label: 'Moje materiály', href: profileMaterialsUrl },
        { label: 'Úprava materiálu' },
      ]
    : [
        { label: 'Domov', href: '/' },
        { label: 'Katalog lekcí', href: '/lessons' },
        { label: 'Detail lekce', href: lessonUrl },
        { label: 'Úprava materiálu' },
      ]

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header with back button */}
      <div>
        <Link href={isFromProfile ? profileMaterialsUrl : lessonUrl}>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            {isFromProfile ? 'Moje materiály' : lesson.title}
          </Button>
        </Link>
      </div>

      {/* Title and Actions - Full Width Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="w-full max-w-[630px] shrink-0">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Název
          </label>
          <Input
            id="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Název materiálu"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {getSaveStatusDisplay()}

          <Button
            variant="outline"
            size="sm"
            className="h-12"
            onClick={() => setViewModalOpen(true)}
          >
            <Eye className="w-4 h-4" />
            Zobrazit
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-12"
            onClick={handleExportPDF}
            disabled={!content || isExportingPDF}
          >
            <Download className="w-4 h-4" />
            Stáhnout PDF
          </Button>

          {exportError && (
            <span className="text-red-600 text-sm">{exportError}</span>
          )}

          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting}
            title="Smazat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Editor - Left Side */}
        <div className="flex-1 lg:flex-2 lg:w-0">
          <PlateEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Obsah materiálu..."
            className="min-h-[600px]"
          />
        </div>

        {/* Sidebar - Right Side */}
        <div className="lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-20 lg:self-start">
          <MaterialEditSidebar lesson={lesson} />
        </div>
      </div>

      {/* View Modal */}
      <LessonMaterialViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title={title}
        content={content}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Smazat materiál"
        description="Opravdu chcete smazat tento materiál? Tato akce je nevratná."
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModal.open}
        onOpenChange={(open) => setFeedbackModal(prev => ({ ...prev, open }))}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
      />
    </div>
  )
}
