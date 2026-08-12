'use client'

import * as React from 'react'
import { getLessonWitnesses } from '@/lib/supabase/lesson-witnesses-client'
import { deleteLessonWitnessAction } from '@/app/actions/lesson-witnesses'
import type { LessonWitness } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { LessonWitnessForm } from './LessonWitnessForm'
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

interface LessonWitnessesManagerProps {
  lessonId: string
  initialWitnesses?: LessonWitness[]
}

export function LessonWitnessesManager({
  lessonId,
  initialWitnesses = [],
}: LessonWitnessesManagerProps) {
  const [witnesses, setWitnesses] = React.useState<LessonWitness[]>(initialWitnesses)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  // Bumped on every open so the form remounts with fresh action state
  const [formKey, setFormKey] = React.useState(0)
  const [editingWitness, setEditingWitness] = React.useState<LessonWitness | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [witnessToDelete, setWitnessToDelete] = React.useState<LessonWitness | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [successModalOpen, setSuccessModalOpen] = React.useState(false)
  const [successModalConfig, setSuccessModalConfig] = React.useState<{
    title: string
    message: string
  }>({ title: '', message: '' })

  const loadWitnesses = React.useCallback(async () => {
    try {
      const data = await getLessonWitnesses(lessonId)
      setWitnesses(data)
    } catch (error) {
      logger.error('Error loading witnesses:', error)
    }
  }, [lessonId])

  // Load witnesses on mount and when lessonId changes
  React.useEffect(() => {
    loadWitnesses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  const handleAdd = () => {
    setEditingWitness(undefined)
    setFormKey((k) => k + 1)
    setIsFormOpen(true)
  }

  const handleEdit = (witness: LessonWitness) => {
    setEditingWitness(witness)
    setFormKey((k) => k + 1)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (witness: LessonWitness) => {
    setWitnessToDelete(witness)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!witnessToDelete) return

    setIsDeleting(true)
    try {
      const deletedName = witnessToDelete.name
      await deleteLessonWitnessAction(witnessToDelete.id, lessonId)
      setDeleteDialogOpen(false)
      setWitnessToDelete(null)
      setSuccessModalConfig({
        title: 'Pamětník byl smazán',
        message: `Pamětník "${deletedName}" byl úspěšně odstraněn.`,
      })
      setSuccessModalOpen(true)
      loadWitnesses()
    } catch (error) {
      logger.error('Error deleting witness:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = React.useCallback(() => {
    const isCreating = !editingWitness
    setSuccessModalConfig({
      title: isCreating ? 'Pamětník byl vytvořen' : 'Pamětník byl uložen',
      message: isCreating
        ? 'Nový pamětník byl úspěšně přidán k lekci.'
        : 'Změny u pamětníka byly úspěšně uloženy.',
    })
    setSuccessModalOpen(true)
    loadWitnesses()
  }, [loadWitnesses, editingWitness])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Pamětníci z příběhu</h2>
        <Button onClick={handleAdd}>
          <Plus />
          Přidat pamětníka
        </Button>
      </div>

      {witnesses.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">Zatím nejsou žádní pamětníci</p>
          <Button onClick={handleAdd} variant="outline">
            Přidat prvního pamětníka
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {witnesses.map((witness) => (
            <div
              key={witness.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="shrink-0 w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {witness.portrait_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={witness.portrait_url}
                    alt={witness.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-sm font-semibold text-gray-400">
                    {witness.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{witness.name}</h3>
                <p className="text-sm text-gray-600 truncate">
                  {[witness.role_short, witness.birth_year ? `*${witness.birth_year}` : null]
                    .filter(Boolean)
                    .join(' • ') || 'Bez role'}
                </p>
              </div>

              <span
                className="shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded"
                title="Pořadí zobrazení"
              >
                #{witness.sort_order}
              </span>

              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleEdit(witness)}>
                  <Edit />
                  Upravit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(witness)}
                >
                  <Trash2 />
                  Smazat
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LessonWitnessForm
        key={formKey}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        lessonId={lessonId}
        witness={editingWitness}
        onSuccess={handleFormSuccess}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smazat pamětníka</DialogTitle>
            <DialogDescription>
              Opravdu chcete smazat pamětníka &quot;{witnessToDelete?.name}&quot;? Tato akce je nevratná.
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
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
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
