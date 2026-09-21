'use client'

import * as React from 'react'
import { getAdditionalActivities } from '@/lib/supabase/additional-activities-client'
import { deleteAdditionalActivityAction } from '@/app/actions/additional-activities'
import type { AdditionalActivity } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Plus, Edit, Trash2, FileText, ExternalLink } from 'lucide-react'
import { AdditionalActivityForm } from './AdditionalActivityForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { FeedbackModal } from '@/components/ui/FeedbackModal'
import { logger } from '@/lib/logger'

interface AdditionalActivitiesManagerProps {
  lessonId: string
  initialActivities?: AdditionalActivity[]
}

export function AdditionalActivitiesManager({
  lessonId,
  initialActivities = [],
}: AdditionalActivitiesManagerProps) {
  const [activities, setActivities] = React.useState<AdditionalActivity[]>(initialActivities)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingActivity, setEditingActivity] = React.useState<AdditionalActivity | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [activityToDelete, setActivityToDelete] = React.useState<AdditionalActivity | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = React.useState(false)
  const [feedbackModalConfig, setFeedbackModalConfig] = React.useState<{
    type: 'success' | 'error'
    title: string
    message: string
  }>({ type: 'success', title: '', message: '' })

  const loadActivities = React.useCallback(async () => {
    try {
      const data = await getAdditionalActivities(lessonId)
      setActivities(data)
    } catch (error) {
      logger.error('Error loading activities:', error)
    }
  }, [lessonId])

  // Load activities on mount and when lessonId changes
  React.useEffect(() => {
    loadActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  const handleAdd = () => {
    setEditingActivity(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (activity: AdditionalActivity) => {
    setEditingActivity(activity)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (activity: AdditionalActivity) => {
    setActivityToDelete(activity)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return

    setIsDeleting(true)
    try {
      const deletedTitle = activityToDelete.title
      const result = await deleteAdditionalActivityAction(activityToDelete.id, lessonId)
      setDeleteDialogOpen(false)
      setActivityToDelete(null)
      if (result?.success) {
        setFeedbackModalConfig({
          type: 'success',
          title: 'Aktivita byla smazána',
          message: `Aktivita "${deletedTitle}" byla úspěšně odstraněna.`,
        })
      } else {
        logger.error('Error deleting activity:', result?.error)
        setFeedbackModalConfig({
          type: 'error',
          title: 'Aktivitu se nepodařilo smazat',
          message: result?.error || 'Zkuste to prosím znovu.',
        })
      }
      setFeedbackModalOpen(true)
      loadActivities()
    } catch (error) {
      logger.error('Error deleting activity:', error)
      setDeleteDialogOpen(false)
      setActivityToDelete(null)
      setFeedbackModalConfig({
        type: 'error',
        title: 'Aktivitu se nepodařilo smazat',
        message: 'Zkuste to prosím znovu.',
      })
      setFeedbackModalOpen(true)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = React.useCallback(() => {
    const isCreating = !editingActivity
    setFeedbackModalConfig({
      type: 'success',
      title: isCreating ? 'Aktivita byla vytvořena' : 'Aktivita byla uložena',
      message: isCreating 
        ? 'Nová aktivita byla úspěšně přidána k lekci.'
        : 'Změny v aktivitě byly úspěšně uloženy.',
    })
    setFeedbackModalOpen(true)
    loadActivities()
  }, [loadActivities, editingActivity])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Doplňkové aktivity</h2>
        <Button onClick={handleAdd}>
          <Plus />
          Přidat aktivitu
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">Zatím nejsou žádné aktivity</p>
          <Button onClick={handleAdd} variant="outline">
            Přidat první aktivitu
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="border border-gray-200 rounded-lg p-4 flex flex-wrap items-start gap-4"
            >
              {activity.image_url && (
                <div className="shrink-0 relative">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {activity.attachment_type === 'pdf' ? (
                      <FileText className="w-10 h-10 text-gray-400" />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {activity.attachment_type === 'pdf' && (
                    <span className="absolute bottom-1 right-1 bg-red-100 text-red-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
                      PDF
                    </span>
                  )}
                </div>
              )}
              <div className="flex-1 basis-48 min-w-0">
                <h3 className="font-semibold mb-1">{activity.title}</h3>
                {activity.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {activity.description}
                  </p>
                )}
                {activity.link_url && (
                  <a
                    href={activity.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline max-w-full"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span className="truncate">{activity.link_url}</span>
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(activity)}
                >
                  <Edit />
                  Upravit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(activity)}
                >
                  <Trash2 />
                  Smazat
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdditionalActivityForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        lessonId={lessonId}
        activity={editingActivity}
        onSuccess={handleFormSuccess}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smazat aktivitu</DialogTitle>
            <DialogDescription>
              Opravdu chcete smazat aktivitu &quot;{activityToDelete?.title}&quot;? Tato akce je nevratná.
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

      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        type={feedbackModalConfig.type}
        title={feedbackModalConfig.title}
        message={feedbackModalConfig.message}
      />
    </div>
  )
}
