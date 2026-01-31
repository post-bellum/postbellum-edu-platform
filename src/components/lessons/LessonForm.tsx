'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { createLessonAction, updateLessonAction } from '@/app/actions/lessons'
import { LessonWithRelations, Tag } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Info, Loader2, Check } from 'lucide-react'
import { TagsSelector } from './TagsSelector'
import { ThumbnailUpload } from './ThumbnailUpload'
import { generateLessonUrl } from '@/lib/utils'

interface LessonFormProps {
  lesson?: LessonWithRelations
  tags: Tag[]
}

export function LessonForm({ lesson, tags }: LessonFormProps) {
  const router = useRouter()
  const isEditing = !!lesson

  const [title, setTitle] = React.useState(lesson?.title || '')
  const [vimeoVideoUrl, setVimeoVideoUrl] = React.useState(lesson?.vimeo_video_url || '')
  const [thumbnailUrl, setThumbnailUrl] = React.useState(lesson?.thumbnail_url || '')
  const [description, setDescription] = React.useState(lesson?.description || '')
  const [duration, setDuration] = React.useState(lesson?.duration || '')
  const [period, setPeriod] = React.useState(lesson?.period || '')
  const [targetGroup, setTargetGroup] = React.useState(lesson?.target_group || '')
  const [lessonType, setLessonType] = React.useState(lesson?.lesson_type || '')
  const [publicationDate, setPublicationDate] = React.useState(
    lesson?.publication_date ? new Date(lesson.publication_date).toISOString().split('T')[0] : ''
  )
  const [rvpConnection, setRvpConnection] = React.useState(
    lesson?.rvp_connection?.join(', ') || ''
  )
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>(
    lesson?.tags?.map(t => t.id) || []
  )
  const [published, setPublished] = React.useState(lesson?.published ?? false)

  // Validation state
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  // Validation errors
  const errors = {
    title: !title.trim() ? 'Název lekce je povinný' : null,
  }

  // Show error only after field is touched or form is submitted
  const showError = (field: keyof typeof errors) => {
    return (touched[field] || submitted) && errors[field]
  }

  const action = async (_prevState: unknown, formData: FormData) => {
    // Add controlled state fields to FormData
    formData.append('tag_ids', selectedTagIds.join(','))
    formData.append('published', published ? 'true' : 'false')
    formData.append('thumbnail_url', thumbnailUrl)
    
    return isEditing
      ? updateLessonAction(lesson.id, formData)
      : createLessonAction(formData)
  }

  // Handle form submission with client-side validation
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setSubmitted(true)
    
    // Prevent submission if there are validation errors
    if (errors.title) {
      e.preventDefault()
    }
  }

  const [state, formAction, isPending] = useActionState(action, null)

  React.useEffect(() => {
    if (lesson) {
      setPublished(lesson.published ?? false)
    }
  }, [lesson])

  React.useEffect(() => {
    if (state?.success && state.data) {
      if (isEditing) {
        // Show success modal for edits
        setShowSuccessModal(true)
      } else {
        // Redirect to edit page for newly created lessons
        const lessonUrl = generateLessonUrl(
          state.data.short_id || state.data.id,
          state.data.title
        )
        React.startTransition(() => {
          router.push(`${lessonUrl}/edit`)
        })
      }
    }
  }, [state, router, isEditing])

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{state.error}</span>
          </div>
        </div>
      )}

      {/* Info for new lesson */}
      {!isEditing && (
        <div className="bg-mint-light border border-mint px-5 py-4 rounded-2xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 shrink-0 text-brand-primary" />
            <span className="text-text-strong">
              Po uložení lekce budete moci přidat pracovní materiály a doprovodné aktivity.
            </span>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden">
        <div className="px-5 py-7 sm:px-7 lg:px-10 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Název lekce *</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                  placeholder="Zadejte název lekce"
                  required
                  aria-invalid={!!showError('title')}
                  aria-describedby={showError('title') ? 'title-error' : undefined}
                  className={showError('title') ? 'border-red-500 focus:border-red-500' : ''}
                />
                {showError('title') && (
                  <p id="title-error" className="text-sm text-red-600 flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Popis lekce</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Popis lekce pro studenty a učitele..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vimeo_video_url">Vimeo Video URL</Label>
                <Input
                  id="vimeo_video_url"
                  name="vimeo_video_url"
                  type="url"
                  value={vimeoVideoUrl}
                  onChange={(e) => setVimeoVideoUrl(e.target.value)}
                  placeholder="https://vimeo.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label>Náhledový obrázek</Label>
                <ThumbnailUpload
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="duration">Délka lekce</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="např. 45 min"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publication_date">Datum publikace</Label>
                  <Input
                    id="publication_date"
                    name="publication_date"
                    type="date"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="target_group">Cílová skupina</Label>
                  <Input
                    id="target_group"
                    name="target_group"
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    placeholder="např. 9. ročník ZŠ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson_type">Typ lekce</Label>
                  <Input
                    id="lesson_type"
                    name="lesson_type"
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value)}
                    placeholder="např. Videovýpověď"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Historické období</Label>
                <Input
                  id="period"
                  name="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="např. 40. léta – 2. světová válka"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rvp_connection">Napojení na RVP</Label>
                <Textarea
                  id="rvp_connection"
                  name="rvp_connection"
                  value={rvpConnection}
                  onChange={(e) => setRvpConnection(e.target.value)}
                  rows={3}
                  placeholder="Dějepis - Moderní dějiny, Osobnostní a sociální výchova (oddělte čárkami)"
                />
              </div>

              <div className="space-y-2">
                <Label>Tagy</Label>
                <TagsSelector
                  tags={tags}
                  selectedTagIds={selectedTagIds}
                  onSelectionChange={setSelectedTagIds}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing & Actions */}
      <div className="bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden">
        <div className="px-5 py-7 sm:px-7">
          <div className="flex items-start gap-3">
            <Checkbox
              id="published"
              checked={published}
              onCheckedChange={(checked) => setPublished(checked === true)}
            />
            <div className="flex-1">
              <Label htmlFor="published" className="cursor-pointer text-base font-medium text-black">
                Publikovat lekci
              </Label>
              <p className="text-sm text-text-subtle mt-0.5">
                Publikovaná lekce bude viditelná pro všechny uživatele.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-grey-200 px-5 py-5 sm:px-7 bg-grey-50">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Zrušit
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? 'Ukládám...' : 'Vytvářím...'}
                </span>
              ) : (
                isEditing ? 'Uložit změny' : 'Vytvořit lekci'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint">
              <Check className="h-6 w-6 text-grey-950" strokeWidth={2} />
            </div>
            <DialogTitle className="text-center">Změny uloženy</DialogTitle>
            <DialogDescription className="text-center">
              Lekce byla úspěšně aktualizována.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col justify-center gap-3">
            <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
              Pokračovat v úpravách
            </Button>
            {lesson && (
              <Button
                variant="primary"
                onClick={() => {
                  const lessonUrl = generateLessonUrl(
                    lesson.short_id || lesson.id,
                    lesson.title
                  )
                  router.push(lessonUrl)
                }}
              >
                Zobrazit lekci
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}

