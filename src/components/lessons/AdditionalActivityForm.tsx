"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import {
  createAdditionalActivityAction,
  updateAdditionalActivityAction,
} from "@/app/actions/additional-activities"
import type { AdditionalActivity } from "@/types/lesson.types"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"

interface AdditionalActivityFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonId: string
  activity?: AdditionalActivity
  onSuccess?: () => void
}

export function AdditionalActivityForm({
  open,
  onOpenChange,
  lessonId,
  activity,
  onSuccess,
}: AdditionalActivityFormProps) {
  const router = useRouter()
  const isEditing = !!activity

  const [title, setTitle] = React.useState(activity?.title || "")
  const [description, setDescription] = React.useState(activity?.description || "")
  const [imageUrl, setImageUrl] = React.useState(activity?.image_url || "")

  // Reset form when modal opens/closes or activity changes
  React.useEffect(() => {
    if (open) {
      setTitle(activity?.title || "")
      setDescription(activity?.description || "")
      setImageUrl(activity?.image_url || "")
    }
  }, [open, activity])

  const action = isEditing
    ? async (_prevState: unknown, formData: FormData) => {
        return updateAdditionalActivityAction(activity.id, formData)
      }
    : async (_prevState: unknown, formData: FormData) => {
        return createAdditionalActivityAction(formData)
      }

  const [state, formAction] = useActionState(action, null)

  React.useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }, [state, onOpenChange, onSuccess])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("lesson_id", lessonId)
    formData.set("title", title)
    formData.set("description", description)
    formData.set("image_url", imageUrl)
    // Use startTransition to wrap the async action
    React.startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Upravit aktivitu" : "Nová aktivita"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Upravte informace o doplňkové aktivitě"
              : "Přidejte novou doplňkovou aktivitu k lekci"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Název *</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="např. Kahoot! Kvíz na zopakování pojmů"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popis (markdown)</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Popis aktivity v markdown formátu..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL obrázku</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
            />
          </div>

          {imageUrl && (
            <div className="space-y-2">
              <Label>Náhled obrázku</Label>
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Zrušit
            </Button>
            <Button type="submit">
              {isEditing ? "Uložit změny" : "Vytvořit aktivitu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

