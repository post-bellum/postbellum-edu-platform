"use client"

import * as React from "react"
import { useActionState } from "react"
import {
  createLessonMaterialAction,
  updateLessonMaterialAction,
} from "@/app/actions/lesson-materials"
import type {
  LessonMaterial,
  LessonSpecification,
} from "@/types/lesson.types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"

interface LessonMaterialFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonId: string
  material?: LessonMaterial
  onSuccess?: () => void
}

export function LessonMaterialForm({
  open,
  onOpenChange,
  lessonId,
  material,
  onSuccess,
}: LessonMaterialFormProps) {
  const isEditing = !!material

  const [title, setTitle] = React.useState(material?.title || "")
  const [description, setDescription] = React.useState(material?.description || "")
  const [content, setContent] = React.useState(material?.content || "")
  const [specification, setSpecification] = React.useState<LessonSpecification | "">(
    material?.specification || ""
  )
  const [duration, setDuration] = React.useState<string>(
    material?.duration?.toString() || ""
  )

  // Reset form when modal opens/closes or material changes
  React.useEffect(() => {
    if (open) {
      setTitle(material?.title || "")
      setDescription(material?.description || "")
      setContent(material?.content || "")
      setSpecification(material?.specification || "")
      setDuration(material?.duration?.toString() || "")
    }
  }, [open, material])

  const action = isEditing
    ? async (_prevState: unknown, formData: FormData) => {
        return updateLessonMaterialAction(material.id, formData)
      }
    : async (_prevState: unknown, formData: FormData) => {
        return createLessonMaterialAction(formData)
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
    formData.set("content", content)
    if (specification) {
      formData.set("specification", specification)
    }
    if (duration) {
      formData.set("duration", duration)
    }
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
            {isEditing ? "Upravit materiál" : "Nový materiál"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Upravte informace o materiálu k lekci"
              : "Přidejte nový materiál k lekci"}
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
              placeholder="např. Pracovní list, Metodický list"
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
              placeholder="Obsahuje:&#10;- Bod 1&#10;- Bod 2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Obsah (markdown)</Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Obsah materiálu v markdown formátu..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specification">Cílová skupina</Label>
              <Select
                value={specification}
                onValueChange={(value) =>
                  setSpecification(value as LessonSpecification)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte skupinu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st_grade_elementary">
                    1. stupeň ZŠ
                  </SelectItem>
                  <SelectItem value="2nd_grade_elementary">
                    2. stupeň ZŠ
                  </SelectItem>
                  <SelectItem value="high_school">Střední školy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Délka (minuty)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte délku" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Zrušit
            </Button>
            <Button type="submit">
              {isEditing ? "Uložit změny" : "Vytvořit materiál"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

