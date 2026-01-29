'use client'

import Link from 'next/link'
import { Download, Copy, Pencil, Trash2, FileText, FileEdit, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime, generateLessonUrl } from '@/lib/utils'
import type { MaterialWithLesson } from './UserEditedMaterialsList'

interface UserMaterialTableRowProps {
  material: MaterialWithLesson
  onView: (material: MaterialWithLesson) => void
  onDownload: (material: MaterialWithLesson) => void
  onDuplicate?: (material: MaterialWithLesson) => void
  onDelete?: (material: MaterialWithLesson) => void
  isDuplicating?: boolean
  isDeleting?: boolean
}

export function UserMaterialTableRow({
  material,
  onView,
  onDownload,
  onDuplicate,
  onDelete,
  isDuplicating,
  isDeleting,
}: UserMaterialTableRowProps) {
  const lessonId = material.lesson_short_id || material.lesson_id
  const lessonUrl = generateLessonUrl(lessonId, material.lesson_title)
  const materialEditUrl = `${lessonUrl}/materials/${material.id}`

  const materialIcon = material.title.toLowerCase().includes('pracovní') 
    ? <FileEdit className="w-4 h-4" />
    : <FileText className="w-4 h-4" />

  return (
    <tr 
      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
      data-testid={`user-material-row-${material.id}`}
    >
      <td className="py-4 pr-12">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">{materialIcon}</span>
          <button
            onClick={() => onView(material)}
            className="font-medium text-left hover:text-blue-600 hover:underline transition-colors"
            data-testid={`user-material-title-${material.id}`}
          >
            {material.title}
          </button>
        </div>
      </td>
      <td className="py-4 pr:8 2xl:pr-20">
        <Link 
          href={lessonUrl}
          className="text-gray-600 hover:text-blue-600 hover:underline line-clamp-1"
          title={material.lesson_title}
          data-testid={`user-material-lesson-link-${material.id}`}
        >
          {material.lesson_title}
        </Link>
      </td>
      <td className="py-4 pr:8 2xl:pr-20 text-gray-600 whitespace-nowrap">
        {formatRelativeTime(material.updated_at)}
      </td>
      <td className="py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Zobrazit"
            onClick={() => onView(material)}
            className="h-9 w-9"
            data-testid={`user-material-view-${material.id}`}
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Link href={materialEditUrl}>
            <Button
              variant="ghost"
              size="icon"
              title="Upravit"
              className="h-9 w-9"
              data-testid={`user-material-edit-${material.id}`}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            title="Stáhnout"
            onClick={() => onDownload(material)}
            disabled={!material.content}
            className="h-9 w-9"
            data-testid={`user-material-download-${material.id}`}
          >
            <Download className="w-4 h-4" />
          </Button>

          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              title="Duplikovat materiál"
              onClick={() => onDuplicate(material)}
              disabled={isDuplicating}
              className="h-9 w-9"
              data-testid={`user-material-duplicate-${material.id}`}
            >
              {isDuplicating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              title="Smazat"
              onClick={() => onDelete(material)}
              disabled={isDeleting}
              className="h-9 w-9 hover:bg-red-50 hover:text-red-600"
              data-testid={`user-material-delete-${material.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
