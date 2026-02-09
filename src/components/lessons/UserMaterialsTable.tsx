'use client'

import * as React from 'react'
import { Eye, Download, Copy, Pencil, FileText, FilePenLine, Loader2, MoreVertical, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/DropdownMenu'

/** Minimal shape for table rows; works with UserLessonMaterial and MaterialWithLesson */
export interface UserMaterialTableItem {
  id: string
  title: string
  updated_at: string
  content?: string | null
}

export interface UserMaterialsTableProps<T extends UserMaterialTableItem = UserMaterialTableItem> {
  materials: T[]
  onView: (material: T) => void
  onEdit: (material: T) => void
  onDownload: (material: T) => void
  onDuplicate?: (material: T) => void
  onDelete?: (material: T) => void
  isDownloading?: string | null
  isDuplicating?: string | null
  /**
   * When provided, a "Lekce" column is shown between Název and Upraveno with this content per row.
   */
  renderLessonCell?: (material: T) => React.ReactNode
  /** Optional test id for the table wrapper */
  dataTestId?: string
  /**
   * If set, adds data-testid to each row as `${rowDataTestId}-${material.id}` and to View/Edit buttons.
   */
  rowDataTestId?: string
}

function getMaterialIcon(title: string) {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('pracovní')) {
    return <FilePenLine className="w-5 h-5 text-brand-primary" />
  }
  return <FileText className="w-5 h-5 text-brand-primary" />
}

export function UserMaterialsTable<T extends UserMaterialTableItem>({
  materials,
  onView,
  onEdit,
  onDownload,
  onDuplicate,
  onDelete,
  isDownloading = null,
  isDuplicating = null,
  renderLessonCell,
  dataTestId,
  rowDataTestId,
}: UserMaterialsTableProps<T>) {
  const showLessonColumn = typeof renderLessonCell === 'function'

  return (
    <div
      className="hidden md:block min-w-[356px]"
      {...(dataTestId ? { 'data-testid': dataTestId } : {})}
    >
      {/* Header row */}
      <div className="flex border-b border-grey-200">
        <div className={`h-12 px-4 min-w-0 flex items-center ${showLessonColumn ? 'flex-[0.6]' : 'flex-1'}`}>
          <span className="text-sm font-medium text-text-strong">Název</span>
        </div>
        {showLessonColumn && (
          <div className="h-12 px-4 flex-[1.4] min-w-0 flex items-center">
            <span className="text-sm font-medium text-text-strong">Lekce</span>
          </div>
        )}
        <div className="h-12 px-4 shrink-0 w-28 flex items-center">
          <span className="text-sm font-medium text-text-strong">Upraveno</span>
        </div>
        <div className="h-12 px-4 shrink-0 w-10" />
        <div className="h-12 px-4 shrink-0 w-10" />
        <div className="h-12 px-4 shrink-0 w-10" />
      </div>
      {/* Data rows */}
      {materials.map((material) => (
        <div
          key={material.id}
          className="flex border-b border-grey-100"
          {...(rowDataTestId ? { 'data-testid': `${rowDataTestId}-${material.id}` } : {})}
        >
          <div className={`h-[52px] px-4 min-w-0 flex items-center gap-2 overflow-hidden ${showLessonColumn ? 'flex-[0.6]' : 'flex-1'}`}>
            {getMaterialIcon(material.title)}
            <button
              type="button"
              onClick={() => onView(material)}
              className="text-left w-full min-w-0 text-sm text-text-strong leading-body-sm truncate hover:text-brand-primary hover:underline transition-colors cursor-pointer bg-transparent border-none p-0"
              title="Zobrazit"
            >
              {material.title}
            </button>
          </div>
          {showLessonColumn && (
            <div className="h-[52px] px-4 flex-[1.4] min-w-0 flex items-center overflow-hidden">
              {renderLessonCell!(material)}
            </div>
          )}
          <div className="h-[52px] px-4 shrink-0 w-28 flex items-center">
            <span className="text-xs text-text-subtle tabular-nums whitespace-nowrap">
              {formatRelativeTime(material.updated_at)}
            </span>
          </div>
          <div className="h-[52px] px-2 shrink-0 flex items-center w-10">
            <button
              onClick={() => onView(material)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-grey-100 transition-colors cursor-pointer"
              title="Zobrazit"
              {...(rowDataTestId ? { 'data-testid': `user-material-view-${material.id}` } : {})}
            >
              <Eye className="w-4 h-4 text-grey-500" />
            </button>
          </div>
          <div className="h-[52px] px-2 shrink-0 flex items-center w-10">
            <button
              onClick={() => onEdit(material)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-grey-100 transition-colors cursor-pointer"
              title="Upravit"
              {...(rowDataTestId ? { 'data-testid': `user-material-edit-${material.id}` } : {})}
            >
              <Pencil className="w-4 h-4 text-grey-500" />
            </button>
          </div>
          <div className="h-[52px] px-2 shrink-0 flex items-center w-10">
            <DropdownMenu
              trigger={
                <div className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-grey-100 transition-colors">
                  <MoreVertical className="w-4 h-4 text-grey-500" />
                </div>
              }
              align="end"
              className="max-w-[160px]"
            >
              <DropdownMenuItem
                onClick={() => onDownload(material)}
                disabled={!material.content || isDownloading === material.id}
                icon={
                  isDownloading === material.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )
                }
              >
                Stáhnout
              </DropdownMenuItem>
              {onDuplicate && (
                <DropdownMenuItem
                  onClick={() => onDuplicate(material)}
                  disabled={isDuplicating === material.id}
                  icon={
                    isDuplicating === material.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )
                  }
                >
                  Duplikovat
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(material)}
                    icon={<Trash2 className="w-4 h-4" />}
                    variant="danger"
                  >
                    Smazat
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
