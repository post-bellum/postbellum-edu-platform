'use client'

import Link from 'next/link'
import { Download, Copy, Pencil, Trash2, FileText, FileEdit, Eye, Loader2 } from 'lucide-react'
import { formatRelativeTime, generateLessonUrl } from '@/lib/utils'
import type { MaterialWithLesson } from './UserEditedMaterialsList'

interface UserMaterialCardProps {
  material: MaterialWithLesson
  onView: (material: MaterialWithLesson) => void
  onDownload: (material: MaterialWithLesson) => void
  onDuplicate?: (material: MaterialWithLesson) => void
  onDelete?: (material: MaterialWithLesson) => void
  isDuplicating?: boolean
  isDeleting?: boolean
}

export function UserMaterialCard({
  material,
  onView,
  onDownload,
  onDuplicate,
  onDelete,
  isDuplicating,
  isDeleting,
}: UserMaterialCardProps) {
  const lessonId = material.lesson_short_id || material.lesson_id
  const lessonUrl = generateLessonUrl(lessonId, material.lesson_title)
  const materialEditUrl = `${lessonUrl}/materials/${material.id}?from=profile`

  const getMaterialIcon = () => {
    return material.title.toLowerCase().includes('pracovní') 
      ? <FileEdit className="w-5 h-5 text-blue-600" />
      : <FileText className="w-5 h-5 text-blue-600" />
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-4"
      data-testid={`user-material-card-${material.id}`}
    >
      {/* Material Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 mt-0.5">
          {getMaterialIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onView(material)}
            className="text-sm font-medium text-left hover:text-blue-600 hover:underline transition-colors line-clamp-2"
          >
            {material.title}
          </button>
          <Link
            href={lessonUrl}
            className="text-xs text-gray-500 hover:text-blue-600 hover:underline mt-1 block line-clamp-1"
          >
            {material.lesson_title}
          </Link>
          <p className="text-xs text-gray-400 mt-1">
            {formatRelativeTime(material.updated_at)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
        <button
          onClick={() => onView(material)}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
        >
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">Zobrazit</span>
        </button>
        <Link 
          href={materialEditUrl}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
        >
          <Pencil className="w-4 h-4" />
          <span className="text-xs font-medium">Upravit</span>
        </Link>
        <button
          onClick={() => onDownload(material)}
          disabled={!material.content}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs font-medium">Stáhnout</span>
        </button>
        {onDuplicate && (
          <button
            onClick={() => onDuplicate(material)}
            disabled={isDuplicating}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50"
          >
            {isDuplicating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">Duplikovat</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(material)}
            disabled={isDeleting}
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-gray-600 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
