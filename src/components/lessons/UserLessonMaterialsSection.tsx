'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Download, Copy, Pencil, FileText, FilePenLine, Loader2 } from 'lucide-react'
import { formatRelativeTime, generateLessonUrl } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { MobileEditWarningDialog } from '@/components/ui/MobileEditWarningDialog'
import { LessonMaterialViewModal } from './LessonMaterialViewModal'
import { UserEditedMaterialCard } from './UserEditedMaterialCard'
import { deleteUserLessonMaterialAction, copyLessonMaterialAction } from '@/app/actions/user-lesson-materials'
import type { UserLessonMaterial } from '@/types/lesson.types'
import { ErrorDialog } from '@/components/ui/ErrorDialog'
import { exportToPDF } from '@/lib/utils/pdf-export'
import { useIsMobile } from '@/hooks/useIsMobile'

interface UserLessonMaterialsSectionProps {
  materials: UserLessonMaterial[]
  lessonId: string
  lessonTitle: string
  lessonShortId?: string | null
  onMaterialDeleted?: (materialId: string) => void
}

export function UserLessonMaterialsSection({ 
  materials, 
  lessonId,
  lessonTitle,
  lessonShortId,
  onMaterialDeleted,
}: UserLessonMaterialsSectionProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedMaterial, setSelectedMaterial] = React.useState<UserLessonMaterial | null>(null)
  const [materialToDelete, setMaterialToDelete] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [duplicatingMaterialId, setDuplicatingMaterialId] = React.useState<string | null>(null)
  const [isExportingPDF, setIsExportingPDF] = React.useState<string | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [mobileEditWarningOpen, setMobileEditWarningOpen] = React.useState(false)

  // Generate base lesson URL using short_id if available
  const idToUse = lessonShortId || lessonId
  const baseLessonUrl = generateLessonUrl(idToUse, lessonTitle)

  const handleView = (material: UserLessonMaterial) => {
    setSelectedMaterial(material)
    setViewModalOpen(true)
  }

  const handleEdit = (material: UserLessonMaterial) => {
    if (isMobile) {
      setMobileEditWarningOpen(true)
    } else {
      router.push(`${baseLessonUrl}/materials/${material.id}`)
    }
  }

  const handleDeleteClick = (materialId: string) => {
    setMaterialToDelete(materialId)
    setDeleteDialogOpen(true)
  }

  const handleDuplicate = async (material: UserLessonMaterial) => {
    if (isMobile) {
      setMobileEditWarningOpen(true)
      return
    }

    setDuplicatingMaterialId(material.id)
    const result = await copyLessonMaterialAction(material.source_material_id, lessonId)

    if (result.success && result.data) {
      router.push(`${baseLessonUrl}/materials/${result.data.id}`)
    } else {
      setErrorMessage(result.error || 'Chyba při duplikování materiálu')
      setErrorDialogOpen(true)
    }
    setDuplicatingMaterialId(null)
  }

  const handleExportPDF = async (material: UserLessonMaterial) => {
    if (!material.content) return

    setIsExportingPDF(material.id)
    setErrorMessage(null)

    try {
      await exportToPDF(material.title, material.content)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Chyba při exportu do PDF'
      setErrorMessage(errorMsg)
      setErrorDialogOpen(true)
    } finally {
      setIsExportingPDF(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return

    setIsDeleting(true)
    const result = await deleteUserLessonMaterialAction(materialToDelete, lessonId)
    
    if (result.success) {
      onMaterialDeleted?.(materialToDelete)
      setDeleteDialogOpen(false)
    } else {
      setErrorMessage(result.error || 'Chyba při mazání materiálu')
      setErrorDialogOpen(true)
    }
    
    setIsDeleting(false)
    setMaterialToDelete(null)
  }

  // Determine icon based on title - metodický = FileText, pracovní = FilePenLine
  const getMaterialIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('pracovní')) {
      return <FilePenLine className="w-5 h-5 text-brand-primary" />
    }
    return <FileText className="w-5 h-5 text-brand-primary" />
  }

  if (materials.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Section Title */}
      <div className="px-4">
        <h2 className="font-display text-2xl font-semibold leading-display text-text-strong">
          Moje upravené materiály k lekci
        </h2>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block min-w-[356px]">
        <div className="flex">
          {/* Name Column */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/* Header */}
            <div className="h-12 px-4 flex items-center border-b border-grey-200">
              <span className="text-sm font-medium text-text-strong">Název</span>
            </div>
            {/* Cells */}
            {materials.map((material) => (
              <div 
                key={material.id} 
                className="h-[52px] px-4 flex items-center gap-2 border-b border-grey-100"
              >
                {getMaterialIcon(material.title)}
                <span className="text-sm text-text-strong leading-body-sm truncate">
                  {material.title}
                </span>
              </div>
            ))}
          </div>

          {/* Last Edited Column */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/* Header */}
            <div className="h-12 px-4 flex items-center border-b border-grey-200">
              <span className="text-sm font-medium text-text-strong">Upraveno</span>
            </div>
            {/* Cells */}
            {materials.map((material) => (
              <div 
                key={material.id} 
                className="h-[52px] px-4 flex items-center border-b border-grey-100"
              >
                <span className="text-xs text-text-subtle tabular-nums">
                  {formatRelativeTime(material.updated_at)}
                </span>
              </div>
            ))}
          </div>

          {/* View Action Column */}
          <div className="shrink-0">
            <div className="h-12 px-4 border-b border-grey-200" />
            {materials.map((material) => (
              <div 
                key={material.id} 
                className="h-[52px] px-2 flex items-center border-b border-grey-100"
              >
                <button
                  onClick={() => handleView(material)}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-grey-100 transition-colors"
                  title="Zobrazit"
                >
                  <Eye className="w-4 h-4 text-grey-500" />
                </button>
              </div>
            ))}
          </div>

          {/* Download Action Column */}
          <div className="shrink-0">
            <div className="h-12 px-4 border-b border-grey-200" />
            {materials.map((material) => (
              <div 
                key={material.id} 
                className="h-[52px] px-2 flex items-center border-b border-grey-100"
              >
                <button
                  onClick={() => handleExportPDF(material)}
                  disabled={!material.content || isExportingPDF === material.id}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-grey-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Stáhnout PDF"
                >
                  {isExportingPDF === material.id ? (
                    <Loader2 className="w-4 h-4 text-grey-500 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-grey-500" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Copy Action Column */}
          <div className="shrink-0">
            <div className="h-12 px-4 border-b border-grey-200" />
            {materials.map((material) => (
              <div 
                key={material.id} 
                className="h-[52px] px-2 flex items-center border-b border-grey-100"
              >
                <button
                  onClick={() => handleDuplicate(material)}
                  disabled={duplicatingMaterialId === material.id}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-grey-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Duplikovat"
                >
                  {duplicatingMaterialId === material.id ? (
                    <Loader2 className="w-4 h-4 text-grey-500 animate-spin" />
                  ) : (
                    <Copy className="w-4 h-4 text-grey-500" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Edit Action Column */}
          <div className="shrink-0">
            <div className="h-12 px-4 border-b border-grey-200" />
            {materials.map((material) => (
              <div 
                key={material.id} 
                className="h-[52px] px-2 flex items-center border-b border-grey-100"
              >
                <button
                  onClick={() => handleEdit(material)}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-grey-100 transition-colors"
                  title="Upravit"
                >
                  <Pencil className="w-4 h-4 text-grey-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-3">
        {materials.map((material) => (
          <UserEditedMaterialCard
            key={material.id}
            material={material}
            onView={() => handleView(material)}
            onEdit={() => handleEdit(material)}
            onDownload={() => handleExportPDF(material)}
            onDuplicate={() => handleDuplicate(material)}
            onDelete={() => handleDeleteClick(material.id)}
            isExportingPDF={isExportingPDF === material.id}
            isDuplicating={duplicatingMaterialId === material.id}
          />
        ))}
      </div>

      {/* View Modal */}
      {selectedMaterial && (
        <LessonMaterialViewModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          title={selectedMaterial.title}
          content={selectedMaterial.content}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setMaterialToDelete(null)
        }}
        title="Smazat materiál"
        description="Opravdu chcete smazat tento materiál? Tato akce je nevratná."
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      <ErrorDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        message={errorMessage}
      />

      <MobileEditWarningDialog 
        open={mobileEditWarningOpen} 
        onOpenChange={setMobileEditWarningOpen} 
      />
    </div>
  )
}
