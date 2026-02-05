'use client'

import Link from 'next/link'
import { Eye, Download, Copy, Pencil, FileText, FilePenLine, Loader2, MoreVertical, Trash2 } from 'lucide-react'
import { formatRelativeTime, generateLessonUrl } from '@/lib/utils'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu'
import type { UserLessonMaterial } from '@/types/lesson.types'

export type MaterialWithLesson = UserLessonMaterial & { 
  lesson_title: string
  lesson_short_id?: string | null 
}

interface UserEditedMaterialCardProps {
  material: UserLessonMaterial | MaterialWithLesson
  lessonTitle?: string
  lessonUrl?: string
  showLessonLink?: boolean
  onView: () => void
  onEdit: () => void
  onDownload: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  isExportingPDF?: boolean
  isDuplicating?: boolean
}

// Type guard to check if material has lesson info
function hasMaterialWithLesson(material: UserLessonMaterial | MaterialWithLesson): material is MaterialWithLesson {
  return 'lesson_title' in material
}

export function UserEditedMaterialCard({
  material,
  lessonTitle,
  lessonUrl,
  showLessonLink = false,
  onView,
  onEdit,
  onDownload,
  onDuplicate,
  onDelete,
  isExportingPDF,
  isDuplicating,
}: UserEditedMaterialCardProps) {
  // Determine icon based on title
  const getMaterialIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('pracovní')) {
      return <FilePenLine className="w-5 h-5 text-brand-primary" />
    }
    return <FileText className="w-5 h-5 text-brand-primary" />
  }

  // Get lesson info for link if showing lesson link
  const resolvedLessonTitle = lessonTitle || (hasMaterialWithLesson(material) ? material.lesson_title : undefined)
  const resolvedLessonUrl = lessonUrl || (hasMaterialWithLesson(material) 
    ? generateLessonUrl(material.lesson_short_id || material.lesson_id, material.lesson_title)
    : undefined)

  return (
    <div className="bg-white border border-grey-200 rounded-xl p-4">
      {/* Material Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 mt-0.5">
          {getMaterialIcon(material.title)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-strong leading-body-sm">
            {material.title}
          </h3>
          {showLessonLink && resolvedLessonTitle && resolvedLessonUrl && (
            <Link
              href={resolvedLessonUrl}
              className="text-xs text-text-subtle hover:text-brand-primary hover:underline mt-1 block line-clamp-1"
            >
              {resolvedLessonTitle}
            </Link>
          )}
          <p className="text-xs text-text-subtle mt-1 tabular-nums">
            {formatRelativeTime(material.updated_at)}
          </p>
        </div>
        
        {/* Dropdown Menu */}
        <DropdownMenu
          trigger={
            <div className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-grey-100 transition-colors">
              <MoreVertical className="w-4 h-4 text-grey-500" />
            </div>
          }
        >
          <DropdownMenuItem 
            onClick={onView}
            icon={<Eye className="w-4 h-4" />}
          >
            Zobrazit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onDownload}
            disabled={!material.content || isExportingPDF}
            icon={isExportingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          >
            Stáhnout PDF
          </DropdownMenuItem>
          {onDuplicate && (
            <DropdownMenuItem 
              onClick={onDuplicate}
              disabled={isDuplicating}
              icon={isDuplicating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            >
              Duplikovat
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={onEdit}
            icon={<Pencil className="w-4 h-4" />}
          >
            Upravit
          </DropdownMenuItem>
          {onDelete && (
            <DropdownMenuItem 
              onClick={onDelete}
              icon={<Trash2 className="w-4 h-4" />}
              variant="danger"
            >
              Smazat
            </DropdownMenuItem>
          )}
        </DropdownMenu>
      </div>

      {/* Action Buttons Row - Quick Access */}
      <div className="flex items-center gap-1 pt-3 border-t border-grey-100">
        <button
          onClick={onView}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg hover:bg-grey-50 transition-colors text-grey-600"
        >
          <Eye className="w-4 h-4" />
          <span className="text-xs font-medium">Zobrazit</span>
        </button>
        <button
          onClick={onDownload}
          disabled={!material.content || isExportingPDF}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg hover:bg-grey-50 transition-colors text-grey-600 disabled:opacity-50"
        >
          {isExportingPDF ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">PDF</span>
        </button>
        <button
          onClick={onEdit}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg hover:bg-grey-50 transition-colors text-grey-600"
        >
          <Pencil className="w-4 h-4" />
          <span className="text-xs font-medium">Upravit</span>
        </button>
      </div>
    </div>
  )
}
