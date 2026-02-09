'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, Trash2 } from 'lucide-react'
import { LessonMaterialViewModal } from '@/components/lessons/LessonMaterialViewModal'
import { UserEditedMaterialCard, type MaterialWithLesson } from '@/components/lessons/UserEditedMaterialCard'
import { UserMaterialsTable } from '@/components/lessons/UserMaterialsTable'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { MobileEditWarningDialog } from '@/components/ui/MobileEditWarningDialog'
import { generateLessonUrl } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'
import { exportToPDF } from '@/lib/utils/pdf-export'

// Re-export for backward compatibility
export type { MaterialWithLesson } from '@/components/lessons/UserEditedMaterialCard'

interface UserEditedMaterialsListProps {
  materials: Array<MaterialWithLesson>
  onDelete?: (materialId: string, lessonId: string) => Promise<void>
  onDuplicate?: (materialId: string, lessonId: string) => Promise<void>
}

export function UserEditedMaterialsList({ materials, onDelete, onDuplicate }: UserEditedMaterialsListProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = React.useState<string | null>(null)
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null)
  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [selectedMaterial, setSelectedMaterial] = React.useState<MaterialWithLesson | null>(null)
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [materialToDelete, setMaterialToDelete] = React.useState<MaterialWithLesson | null>(null)

  // Mobile warning modal
  const [mobileEditWarningOpen, setMobileEditWarningOpen] = React.useState(false)

  const handleView = (material: MaterialWithLesson) => {
    setSelectedMaterial(material)
    setViewModalOpen(true)
  }

  const handleEdit = (material: MaterialWithLesson) => {
    if (isMobile) {
      setMobileEditWarningOpen(true)
    } else {
      const lessonId = material.lesson_short_id || material.lesson_id
      const lessonUrl = generateLessonUrl(lessonId, material.lesson_title)
      const materialEditUrl = `${lessonUrl}/materials/${material.id}?from=profile`
      router.push(materialEditUrl)
    }
  }

  const handleDeleteClick = (material: MaterialWithLesson) => {
    if (!onDelete) return
    setMaterialToDelete(material)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!onDelete || !materialToDelete) return

    setDeletingId(materialToDelete.id)
    try {
      await onDelete(materialToDelete.id, materialToDelete.lesson_id)
      setDeleteModalOpen(false)
    } finally {
      setDeletingId(null)
      setMaterialToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setMaterialToDelete(null)
  }

  const handleDuplicate = async (material: MaterialWithLesson) => {
    if (!onDuplicate) return

    if (isMobile) {
      setMobileEditWarningOpen(true)
      return
    }

    setDuplicatingId(material.id)
    try {
      await onDuplicate(material.id, material.lesson_id)
    } finally {
      setDuplicatingId(null)
    }
  }

  const handleDownload = async (material: MaterialWithLesson) => {
    if (!material.content) {
      alert('Materiál nemá žádný obsah ke stažení')
      return
    }

    setDownloadingId(material.id)
    try {
      await exportToPDF(material.title, material.content)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Chyba při exportu do PDF'
      alert(errorMsg)
    } finally {
      setDownloadingId(null)
    }
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500" data-testid="user-materials-empty">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">Zatím nemáte žádné upravené materiály</p>
        <p className="text-sm">
          Až budete upravovat materiály v lekcích, objeví se zde.
        </p>
      </div>
    )
  }

  return (
    <div data-testid="user-materials-list">
      {/* Desktop Table View */}
      <UserMaterialsTable<MaterialWithLesson>
        materials={materials}
        onView={handleView}
        onEdit={handleEdit}
        onDownload={handleDownload}
        onDuplicate={onDuplicate ? handleDuplicate : undefined}
        onDelete={onDelete ? handleDeleteClick : undefined}
        isDownloading={downloadingId}
        isDuplicating={duplicatingId}
        renderLessonCell={(material) => {
          const lessonUrl = generateLessonUrl(
            material.lesson_short_id || material.lesson_id,
            material.lesson_title
          )
          return (
            <Link
              href={lessonUrl}
              className="text-sm text-text-subtle leading-body-sm truncate block hover:text-brand-primary hover:underline"
              title={material.lesson_title}
              data-testid={`user-material-lesson-link-${material.id}`}
            >
              {material.lesson_title}
            </Link>
          )
        }}
        dataTestId="user-materials-table"
        rowDataTestId="user-material-row"
      />

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-3">
        {materials.map((material) => (
          <UserEditedMaterialCard
            key={material.id}
            material={material}
            showLessonLink
            onView={() => handleView(material)}
            onEdit={() => handleEdit(material)}
            onDownload={() => handleDownload(material)}
            onDuplicate={onDuplicate ? () => handleDuplicate(material) : undefined}
            onDelete={onDelete ? () => handleDeleteClick(material) : undefined}
            isExportingPDF={downloadingId === material.id}
            isDuplicating={duplicatingId === material.id}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[440px]" data-testid="delete-material-modal">
          <div className="space-y-5">
            {/* Icon & Title */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900" data-testid="delete-material-modal-title">
                Smazat materiál?
              </h2>
            </div>

            {/* Material Info */}
            {materialToDelete && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Chystáte se smazat:</p>
                <p className="font-medium text-gray-900">{materialToDelete.title}</p>
                <p className="text-xs text-gray-500 mt-1">z lekce: {materialToDelete.lesson_title}</p>
              </div>
            )}

            {/* Warning */}
            <p className="text-sm text-gray-600 text-center">
              Tato akce je <span className="font-medium text-red-600">nevratná</span>. 
              Materiál bude trvale odstraněn.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelDelete}
                disabled={deletingId !== null}
                data-testid="delete-material-cancel-button"
              >
                Zrušit
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteConfirm}
                disabled={deletingId !== null}
                data-testid="delete-material-confirm-button"
              >
                {deletingId !== null ? 'Mazání...' : 'Smazat materiál'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MobileEditWarningDialog 
        open={mobileEditWarningOpen} 
        onOpenChange={setMobileEditWarningOpen} 
      />
    </div>
  )
}

