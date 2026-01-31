'use client'

import * as React from 'react'
import { getAdditionalActivities } from '@/lib/supabase/additional-activities-client'
import { deleteAdditionalActivityAction } from '@/app/actions/additional-activities'
import type { AdditionalActivity } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Plus, Edit, Trash2 } from 'lucide-react'
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
  const [successModalOpen, setSuccessModalOpen] = React.useState(false)
  const [successModalConfig, setSuccessModalConfig] = React.useState<{
    title: string
    message: string
  }>({ title: '', message: '' })

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
      await deleteAdditionalActivityAction(activityToDelete.id, lessonId)
      setDeleteDialogOpen(false)
      setActivityToDelete(null)
      setSuccessModalConfig({
        title: 'Aktivita byla smazána',
        message: `Aktivita "${deletedTitle}" byla úspěšně odstraněna.`,
      })
      setSuccessModalOpen(true)
      loadActivities()
    } catch (error) {
      logger.error('Error deleting activity:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = React.useCallback(() => {
    const isCreating = !editingActivity
    setSuccessModalConfig({
      title: isCreating ? 'Aktivita byla vytvořena' : 'Aktivita byla uložena',
      message: isCreating 
        ? 'Nová aktivita byla úspěšně přidána k lekci.'
        : 'Změny v aktivitě byly úspěšně uloženy.',
    })
    setSuccessModalOpen(true)
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
              className="border border-gray-200 rounded-lg p-4 flex items-start gap-4"
            >
              {activity.image_url && (
                <div className="shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{activity.title}</h3>
                {activity.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {activity.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
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
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        type="success"
        title={successModalConfig.title}
        message={successModalConfig.message}
      />
    </div>
  )
}
