'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { updateUserLessonMaterialAction } from '@/app/actions/user-lesson-materials'
import type { UserLessonMaterial } from '@/types/lesson.types'

interface UserLessonMaterialEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: UserLessonMaterial
  onSaved?: (material: UserLessonMaterial) => void
}

export function UserLessonMaterialEditModal({
  open,
  onOpenChange,
  material,
  onSaved,
}: UserLessonMaterialEditModalProps) {
  const [title, setTitle] = React.useState(material.title)
  const [content, setContent] = React.useState(material.content || '')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [editorResetKey, setEditorResetKey] = React.useState(0)

  // Reset form when material changes
  React.useEffect(() => {
    setTitle(material.title)
    setContent(material.content || '')
    setError(null)
    setEditorResetKey(prev => prev + 1)
  }, [material])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('content', content)

    const result = await updateUserLessonMaterialAction(material.id, formData)

    if (result.success && result.data) {
      onOpenChange(false)
      onSaved?.(result.data)
    } else if (!result.success) {
      setError(result.error || 'Chyba při ukládání')
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upravit materiál</DialogTitle>
          <DialogDescription>
            Upravte název a obsah vašeho materiálu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-4 overflow-hidden">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Název</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Název materiálu"
              required
            />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Label className="mb-2">Obsah</Label>
            <div className="flex-1 overflow-y-auto">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Obsah materiálu..."
                className="min-h-[400px]"
                resetKey={editorResetKey}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ukládám...' : 'Uložit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
