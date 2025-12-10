'use client'

import * as React from 'react'
import Link from 'next/link'
import { Eye, Download, Pencil, Trash2, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LessonMaterialViewModal } from './LessonMaterialViewModal'
import { deleteUserLessonMaterialAction } from '@/app/actions/user-lesson-materials'
import type { UserLessonMaterial } from '@/types/lesson.types'

interface UserLessonMaterialsSectionProps {
  materials: UserLessonMaterial[]
  lessonId: string
  onMaterialDeleted?: (materialId: string) => void
}

export function UserLessonMaterialsSection({ 
  materials, 
  lessonId,
  onMaterialDeleted,
}: UserLessonMaterialsSectionProps) {
  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedMaterial, setSelectedMaterial] = React.useState<UserLessonMaterial | null>(null)
  const [materialToDelete, setMaterialToDelete] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleView = (material: UserLessonMaterial) => {
    setSelectedMaterial(material)
    setViewModalOpen(true)
  }

  const handleDeleteClick = (materialId: string) => {
    setMaterialToDelete(materialId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return

    setIsDeleting(true)
    const result = await deleteUserLessonMaterialAction(materialToDelete, lessonId)
    
    if (result.success) {
      onMaterialDeleted?.(materialToDelete)
      setDeleteDialogOpen(false)
    } else {
      // TODO: Replace alert with toast notification system for better UX
      alert(result.error || 'Chyba při mazání materiálu')
    }
    
    setIsDeleting(false)
    setMaterialToDelete(null)
  }

  // Determine icon based on title
  const getMaterialIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('metodický') || lowerTitle.includes('metodický list')) {
      return <FileText className="w-4 h-4 text-gray-500" />
    }
    if (lowerTitle.includes('pracovní') || lowerTitle.includes('pracovní list')) {
      return <FileSpreadsheet className="w-4 h-4 text-gray-500" />
    }
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  if (materials.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Moje upravené materiály k lekci</h2>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Název</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Vytvořeno</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Akce</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr key={material.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getMaterialIcon(material.title)}
                    <span>{material.title}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {formatDate(material.created_at)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(material)}
                      title="Zobrazit"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      title="Stáhnout (připravujeme)"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Link href={`/lessons/${lessonId}/materials/${material.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Upravit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(material.id)}
                      disabled={isDeleting && materialToDelete === material.id}
                      title="Smazat"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  )
}
