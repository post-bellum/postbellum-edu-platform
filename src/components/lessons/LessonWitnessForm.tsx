'use client'

import * as React from 'react'
import { useActionState } from 'react'
import {
  createLessonWitnessAction,
  updateLessonWitnessAction,
} from '@/app/actions/lesson-witnesses'
import type { LessonWitness } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { ThumbnailUpload } from '@/components/lessons/ThumbnailUpload'

const BIO_MAX_LENGTH = 1800

interface LessonWitnessFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonId: string
  witness?: LessonWitness
  onSuccess?: () => void
}

export function LessonWitnessForm({
  open,
  onOpenChange,
  lessonId,
  witness,
  onSuccess,
}: LessonWitnessFormProps) {
  const isEditing = !!witness

  const [name, setName] = React.useState(witness?.name || '')
  const [roleShort, setRoleShort] = React.useState(witness?.role_short || '')
  const [roleFull, setRoleFull] = React.useState(witness?.role_full || '')
  const [birthYear, setBirthYear] = React.useState(witness?.birth_year?.toString() || '')
  const [bio, setBio] = React.useState(witness?.bio || '')
  const [portraitUrl, setPortraitUrl] = React.useState(witness?.portrait_url || '')
  const [memoryOfNationsUrl, setMemoryOfNationsUrl] = React.useState(
    witness?.memory_of_nations_url || ''
  )
  const [sortOrder, setSortOrder] = React.useState(witness?.sort_order?.toString() || '0')

  // Reset form when modal opens/closes or witness changes
  React.useEffect(() => {
    if (open) {
      setName(witness?.name || '')
      setRoleShort(witness?.role_short || '')
      setRoleFull(witness?.role_full || '')
      setBirthYear(witness?.birth_year?.toString() || '')
      setBio(witness?.bio || '')
      setPortraitUrl(witness?.portrait_url || '')
      setMemoryOfNationsUrl(witness?.memory_of_nations_url || '')
      setSortOrder(witness?.sort_order?.toString() || '0')
    }
  }, [open, witness])

  const action = isEditing
    ? async (_prevState: unknown, formData: FormData) => {
        return updateLessonWitnessAction(witness.id, formData)
      }
    : async (_prevState: unknown, formData: FormData) => {
        return createLessonWitnessAction(formData)
      }

  const [state, formAction] = useActionState(action, null)

  // Each action result must be handled only once. Without this guard the effect
  // re-fires whenever onSuccess/onOpenChange change identity, replaying a stale
  // success (e.g. right after opening the form to edit another witness).
  const handledStateRef = React.useRef<unknown>(null)

  React.useEffect(() => {
    if (state?.success && handledStateRef.current !== state) {
      handledStateRef.current = state
      onOpenChange(false)
      onSuccess?.()
    }
  }, [state, onOpenChange, onSuccess])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('lesson_id', lessonId)
    formData.set('name', name)
    formData.set('role_short', roleShort)
    formData.set('role_full', roleFull)
    formData.set('birth_year', birthYear)
    formData.set('bio', bio)
    formData.set('portrait_url', portraitUrl)
    formData.set('memory_of_nations_url', memoryOfNationsUrl)
    formData.set('sort_order', sortOrder)
    React.startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[672px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Upravit pamětníka' : 'Nový pamětník'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Upravte informace o pamětníkovi'
              : 'Přidejte nového pamětníka k lekci'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="witness-name">Jméno *</Label>
            <Input
              id="witness-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="např. Jiří Šedivý"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="witness-role-short">Krátká role</Label>
              <Input
                id="witness-role-short"
                value={roleShort}
                onChange={(e) => setRoleShort(e.target.value)}
                placeholder="např. Diplomat"
              />
              <p className="text-xs text-text-subtle">Zobrazuje se na kartě pamětníka</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="witness-birth-year">Rok narození</Label>
              <Input
                id="witness-birth-year"
                type="number"
                min={1850}
                max={2100}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="např. 1953"
              />
              <p className="text-xs text-text-subtle">Zobrazuje se v detailu jako „*1953“</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="witness-role-full">Dlouhá role</Label>
            <Input
              id="witness-role-full"
              value={roleFull}
              onChange={(e) => setRoleFull(e.target.value)}
              placeholder="např. Náčelník Generálního štábu Armády České republiky (1998–2002)"
            />
            <p className="text-xs text-text-subtle">Zobrazuje se v detailu pamětníka</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="witness-bio">Životopis</Label>
            <Textarea
              id="witness-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={8}
              maxLength={BIO_MAX_LENGTH}
              placeholder="Stručný text o životě pamětníka (cca 1500 znaků)..."
            />
            <p className="text-xs text-text-subtle">
              {bio.length} / {BIO_MAX_LENGTH} znaků — delší text se v detailu pamětníka roluje
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="witness-memory-url">Odkaz na Paměť národa</Label>
            <Input
              id="witness-memory-url"
              type="url"
              value={memoryOfNationsUrl}
              onChange={(e) => setMemoryOfNationsUrl(e.target.value)}
              placeholder="https://www.pametnaroda.cz/cs/sedivy-jiri-1953"
            />
          </div>

          <div className="space-y-2">
            <Label>Portrét</Label>
            <ThumbnailUpload
              value={portraitUrl}
              onChange={setPortraitUrl}
              variant="avatar"
              folder="witnesses"
              alt={name ? `Portrét ${name}` : 'Portrét pamětníka'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="witness-sort-order">Pořadí</Label>
            <Input
              id="witness-sort-order"
              type="number"
              min={0}
              max={9999}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
            <p className="text-xs text-text-subtle">
              Nižší číslo se zobrazí dřív. Při shodném pořadí rozhoduje datum vytvoření.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Zrušit
            </Button>
            <Button type="submit">
              {isEditing ? 'Uložit změny' : 'Vytvořit pamětníka'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
