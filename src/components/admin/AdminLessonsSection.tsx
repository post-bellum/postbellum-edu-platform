'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { BookOpen, Plus, Eye, FileCheck, FileX, Pencil, Trash2 } from 'lucide-react'
import { 
  getAdminLessons, 
  deleteLessonAction,
  type AdminLessonsStats 
} from '@/app/actions/lessons'
import { generateLessonUrlFromLesson } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { logger } from '@/lib/logger'
import type { LessonWithRelations } from '@/types/lesson.types'

export function AdminLessonsSection() {
  const router = useRouter()
  const [lessons, setLessons] = React.useState<LessonWithRelations[]>([])
  const [stats, setStats] = React.useState<AdminLessonsStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [lessonToDelete, setLessonToDelete] = React.useState<LessonWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const loadLessons = React.useCallback(async () => {
    const result = await getAdminLessons()
    if (result.success && result.data) {
      setLessons(result.data)
      setStats(result.stats || null)
    } else {
      setError(result.error || 'Chyba při načítání')
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadLessons()
  }, [loadLessons])

  const handleDeleteClick = (lesson: LessonWithRelations) => {
    setLessonToDelete(lesson)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!lessonToDelete) return
    
    setIsDeleting(true)
    try {
      const result = await deleteLessonAction(lessonToDelete.id)
      if (result.success) {
        setDeleteDialogOpen(false)
        setLessonToDelete(null)
        // Reload lessons list
        await loadLessons()
      } else {
        logger.error('Error deleting lesson:', result.error)
      }
    } catch (error) {
      logger.error('Error deleting lesson:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getEditUrl = (lesson: LessonWithRelations) => {
    const baseUrl = generateLessonUrlFromLesson(lesson)
    return `${baseUrl}/edit`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-grey-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-grey-100 rounded w-48" />
          <div className="h-20 bg-grey-100 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-[28px] border border-grey-200 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-[28px] border border-grey-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-grey-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              <h2 className="font-display text-xl font-semibold">Správa lekcí</h2>
            </div>
            <Button 
              asChild
              variant="primary"
              size="small"
            >
              <Link href="/lessons/new">
                <Plus className="w-4 h-4" />
                Nová lekce
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 divide-x divide-grey-100 border-b border-grey-100">
            <div className="px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-2 text-text-subtle mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Celkem</span>
              </div>
              <p className="text-2xl font-semibold text-text-strong">{stats.total}</p>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-700 mb-1">
                <FileCheck className="w-4 h-4" />
                <span className="text-sm">Publikované</span>
              </div>
              <p className="text-2xl font-semibold text-emerald-700">{stats.published}</p>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                <FileX className="w-4 h-4" />
                <span className="text-sm">Nepublikované</span>
              </div>
              <p className="text-2xl font-semibold text-orange-600">{stats.unpublished}</p>
            </div>
          </div>
        )}

        {/* Lessons List */}
        <div className="max-h-[500px] overflow-y-auto">
          {lessons.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-subtle">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Zatím žádné lekce</p>
              <Button 
                asChild 
                variant="primary" 
                size="small" 
                className="mt-4"
              >
                <Link href="/lessons/new">
                  <Plus className="w-4 h-4" />
                  Vytvořit první lekci
                </Link>
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-grey-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider">
                    Název
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-text-subtle uppercase tracking-wider hidden sm:table-cell">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-subtle uppercase tracking-wider hidden md:table-cell">
                    Vytvořeno
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-text-subtle uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-grey-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-strong line-clamp-1">
                          {lesson.title}
                        </span>
                        {lesson.description && (
                          <span className="text-xs text-text-subtle line-clamp-1 mt-0.5">
                            {lesson.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      {lesson.published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Publikováno
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Nepublikováno
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-text-subtle">
                        {lesson.created_at 
                          ? new Date(lesson.created_at).toLocaleDateString('cs-CZ')
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-grey-600 hover:text-brand-primary hover:bg-grey-100"
                        >
                          <Link href={generateLessonUrlFromLesson(lesson)}>
                            <Eye className="w-4 h-4" />
                            <span className="sr-only">Zobrazit</span>
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-grey-600 hover:text-brand-primary hover:bg-grey-100"
                        >
                          <Link href={getEditUrl(lesson)}>
                            <Pencil className="w-4 h-4" />
                            <span className="sr-only">Upravit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-grey-600 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClick(lesson)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Smazat</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smazat lekci</DialogTitle>
            <DialogDescription>
              Opravdu chcete smazat lekci &quot;{lessonToDelete?.title}&quot;? Tato akce je nevratná a smaže také všechny související materiály a aktivity.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Zrušit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Mazání...' : 'Smazat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
