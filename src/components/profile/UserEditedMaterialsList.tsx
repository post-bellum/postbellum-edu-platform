'use client'

import * as React from 'react'
import { FileText } from 'lucide-react'
import { LessonMaterialViewModal } from '@/components/lessons/LessonMaterialViewModal'
import { UserMaterialCard } from './UserMaterialCard'
import { UserMaterialTableRow } from './UserMaterialTableRow'
import type { UserLessonMaterial } from '@/types/lesson.types'

export type MaterialWithLesson = UserLessonMaterial & { lesson_title: string; lesson_short_id?: string | null }

interface UserEditedMaterialsListProps {
  materials: Array<MaterialWithLesson>
  onDelete?: (materialId: string, lessonId: string) => Promise<void>
  onDuplicate?: (materialId: string, lessonId: string) => Promise<void>
}

export function UserEditedMaterialsList({ materials, onDelete, onDuplicate }: UserEditedMaterialsListProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = React.useState<string | null>(null)
  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [selectedMaterial, setSelectedMaterial] = React.useState<MaterialWithLesson | null>(null)

  const handleView = (material: MaterialWithLesson) => {
    setSelectedMaterial(material)
    setViewModalOpen(true)
  }

  const handleDelete = async (material: MaterialWithLesson) => {
    if (!onDelete) return
    
    if (!confirm(`Opravdu chcete smazat "${material.title}"?`)) {
      return
    }

    setDeletingId(material.id)
    try {
      await onDelete(material.id, material.lesson_id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDuplicate = async (material: MaterialWithLesson) => {
    if (!onDuplicate) return

    setDuplicatingId(material.id)
    try {
      await onDuplicate(material.id, material.lesson_id)
    } finally {
      setDuplicatingId(null)
    }
  }

  const handleDownload = (material: MaterialWithLesson) => {
    if (!material.content) {
      alert('Materiál nemá žádný obsah ke stažení')
      return
    }

    const blob = new Blob([material.content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${material.title}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
      <div className="hidden md:block">
        <table className="w-full table-auto" data-testid="user-materials-table">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 pr-4 font-medium text-gray-600 min-w-[220px]">Název</th>
              <th className="pb-3 pr-4 font-medium text-gray-600">Lekce</th>
              <th className="pb-3 pr-4 font-medium text-gray-600 whitespace-nowrap w-[10%]">Upraveno</th>
              <th className="pb-3 font-medium text-gray-600 text-right whitespace-nowrap">Akce</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <UserMaterialTableRow
                key={material.id}
                material={material}
                onView={handleView}
                onDownload={handleDownload}
                onDuplicate={onDuplicate ? handleDuplicate : undefined}
                onDelete={onDelete ? handleDelete : undefined}
                isDuplicating={duplicatingId === material.id}
                isDeleting={deletingId === material.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-3">
        {materials.map((material) => (
          <UserMaterialCard
            key={material.id}
            material={material}
            onView={handleView}
            onDownload={handleDownload}
            onDuplicate={onDuplicate ? handleDuplicate : undefined}
            onDelete={onDelete ? handleDelete : undefined}
            isDuplicating={duplicatingId === material.id}
            isDeleting={deletingId === material.id}
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
    </div>
  )
}

