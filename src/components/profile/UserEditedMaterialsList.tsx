'use client'

import * as React from 'react'
import Link from 'next/link'
import { Download, Copy, Pencil, Trash2, FileText, FileEdit } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { UserLessonMaterial } from '@/types/lesson.types'

interface UserEditedMaterialsListProps {
  materials: Array<UserLessonMaterial & { lesson_title: string }>
  onDelete?: (materialId: string, lessonId: string) => Promise<void>
  onDuplicate?: (materialId: string, lessonId: string) => Promise<void>
}

export function UserEditedMaterialsList({ materials, onDelete, onDuplicate }: UserEditedMaterialsListProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = React.useState<string | null>(null)

  const handleDelete = async (material: UserLessonMaterial & { lesson_title: string }) => {
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

  const handleDuplicate = async (material: UserLessonMaterial & { lesson_title: string }) => {
    if (!onDuplicate) return

    setDuplicatingId(material.id)
    try {
      await onDuplicate(material.id, material.lesson_id)
    } finally {
      setDuplicatingId(null)
    }
  }

  const handleDownload = (material: UserLessonMaterial & { lesson_title: string }) => {
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
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">Zatím nemáte žádné upravené materiály</p>
        <p className="text-sm">
          Až budete upravovat materiály v lekcích, objeví se zde.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="pb-3 pr-4 font-medium text-gray-600">Název</th>
            <th className="pb-3 pr-4 font-medium text-gray-600">Lekce</th>
            <th className="pb-3 pr-4 font-medium text-gray-600">Vytvořeno</th>
            <th className="pb-3 font-medium text-gray-600 text-right">Akce</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => {
            const isDeleting = deletingId === material.id
            const materialIcon = material.title.toLowerCase().includes('pracovní') 
              ? <FileEdit className="w-4 h-4" />
              : <FileText className="w-4 h-4" />

            return (
              <tr 
                key={material.id} 
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">{materialIcon}</span>
                    <span className="font-medium">{material.title}</span>
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <Link 
                    href={`/lessons/${material.lesson_id}`}
                    className="text-gray-600 hover:text-blue-600 hover:underline line-clamp-1"
                    title={material.lesson_title}
                  >
                    {material.lesson_title}
                  </Link>
                </td>
                <td className="py-4 pr-4 text-gray-600">
                  {formatDate(material.created_at)}
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* View/Edit */}
                    <Link href={`/lessons/${material.lesson_id}/materials/${material.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Zobrazit/Upravit"
                        className="h-9 w-9"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>

                    {/* Download */}
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Stáhnout"
                      onClick={() => handleDownload(material)}
                      disabled={!material.content}
                      className="h-9 w-9"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    {/* Duplicate */}
                    {onDuplicate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Duplikovat materiál"
                        onClick={() => handleDuplicate(material)}
                        disabled={duplicatingId === material.id}
                        className="h-9 w-9"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Delete */}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Smazat"
                        onClick={() => handleDelete(material)}
                        disabled={isDeleting}
                        className="h-9 w-9 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

