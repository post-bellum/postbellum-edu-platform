'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Eye, Copy, Trash2, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { LessonMaterialViewModal } from './LessonMaterialViewModal'
import { MaterialEditSidebar } from './MaterialEditSidebar'
import {
  updateUserLessonMaterialAction,
  deleteUserLessonMaterialAction,
  copyLessonMaterialAction,
} from '@/app/actions/user-lesson-materials'
import type { UserLessonMaterial, LessonWithRelations } from '@/types/lesson.types'

interface UserMaterialEditContentProps {
  material: UserLessonMaterial
  lesson: LessonWithRelations
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function UserMaterialEditContent({
  material: initialMaterial,
  lesson,
}: UserMaterialEditContentProps) {
  const router = useRouter()
  const [title, setTitle] = React.useState(initialMaterial.title)
  const [content, setContent] = React.useState(initialMaterial.content || '')
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>('idle')
  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDuplicating, setIsDuplicating] = React.useState(false)

  // Debounced auto-save
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = React.useRef({ title: initialMaterial.title, content: initialMaterial.content || '' })

  const saveChanges = React.useCallback(async (newTitle: string, newContent: string) => {
    // Skip if nothing changed
    if (newTitle === lastSavedRef.current.title && newContent === lastSavedRef.current.content) {
      return
    }

    setSaveStatus('saving')

    const formData = new FormData()
    formData.set('title', newTitle)
    formData.set('content', newContent)

    const result = await updateUserLessonMaterialAction(initialMaterial.id, formData)

    if (result.success) {
      setSaveStatus('saved')
      lastSavedRef.current = { title: newTitle, content: newContent }
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('error')
    }
  }, [initialMaterial.id])

  // Auto-save on title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges(newTitle, content)
    }, 1000)
  }

  // Auto-save on content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent)

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges(title, newContent)
    }, 1000)
  }

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    const result = await deleteUserLessonMaterialAction(initialMaterial.id, lesson.id)

    if (result.success) {
      router.push(`/lessons/${lesson.id}`)
    } else {
      alert(result.error || 'Chyba při mazání materiálu')
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    const result = await copyLessonMaterialAction(initialMaterial.source_material_id, lesson.id)

    if (result.success && result.data) {
      // Navigate to the new duplicate
      router.push(`/lessons/${lesson.id}/materials/${result.data.id}`)
    } else {
      alert(result.error || 'Chyba při duplikování materiálu')
    }
    setIsDuplicating(false)
  }

  const getSaveStatusDisplay = () => {
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
          <span className="text-red-600 text-sm">
            Chyba při ukládání
          </span>
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-4">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-gray-700">Domov</Link>
          </li>
          <li className="text-gray-400">{'>'}</li>
          <li>
            <Link href="/lessons" className="hover:text-gray-700">Katalog lekcí</Link>
          </li>
          <li className="text-gray-400">{'>'}</li>
          <li>
            <Link href={`/lessons/${lesson.id}`} className="hover:text-gray-700">Detail lekce</Link>
          </li>
          <li className="text-gray-400">{'>'}</li>
          <li className="text-gray-900">Úprava materiálu</li>
        </ol>
      </nav>

      {/* Header with back button */}
      <div className="mb-6">
        <Link href={`/lessons/${lesson.id}`}>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            {lesson.title}
          </Button>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Editor - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Název
              </label>
              <Input
                id="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Název materiálu"
                className="max-w-md"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {getSaveStatusDisplay()}

              <Button
                variant="outline"
                size="sm"
                disabled
                title="Připravujeme"
              >
                <Download className="w-4 h-4" />
                Stáhnout PDF
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewModalOpen(true)}
              >
                <Eye className="w-4 h-4" />
                Zobrazit
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={isDuplicating}
              >
                <Copy className="w-4 h-4" />
                {isDuplicating ? 'Duplikuji...' : 'Duplikovat'}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeleting}
                title="Smazat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Rich Text Editor */}
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Obsah materiálu..."
            className="min-h-[600px]"
          />
        </div>

        {/* Sidebar - Right Side */}
        <div className="lg:col-span-1">
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
    </>
  )
}
