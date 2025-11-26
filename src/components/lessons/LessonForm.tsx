"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { createLessonAction, updateLessonAction } from "@/app/actions/lessons"
import { LessonWithRelations, Tag } from "@/types/lesson.types"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Checkbox } from "@/components/ui/Checkbox"
import { TagsSelector } from "./TagsSelector"

interface LessonFormProps {
  lesson?: LessonWithRelations
  tags: Tag[]
}

export function LessonForm({ lesson, tags }: LessonFormProps) {
  const router = useRouter()
  const isEditing = !!lesson

  const [title, setTitle] = React.useState(lesson?.title || "")
  const [vimeoVideoUrl, setVimeoVideoUrl] = React.useState(lesson?.vimeo_video_url || "")
  const [description, setDescription] = React.useState(lesson?.description || "")
  const [duration, setDuration] = React.useState(lesson?.duration || "")
  const [period, setPeriod] = React.useState(lesson?.period || "")
  const [targetGroup, setTargetGroup] = React.useState(lesson?.target_group || "")
  const [lessonType, setLessonType] = React.useState(lesson?.lesson_type || "")
  const [publicationDate, setPublicationDate] = React.useState(
    lesson?.publication_date ? new Date(lesson.publication_date).toISOString().split('T')[0] : ""
  )
  const [rvpConnection, setRvpConnection] = React.useState(
    lesson?.rvp_connection?.join(", ") || ""
  )
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>(
    lesson?.tags?.map(t => t.id) || []
  )
  const [published, setPublished] = React.useState(lesson?.published ?? false)

  const action = isEditing
    ? async (_prevState: unknown, formData: FormData) => {
        formData.append("tag_ids", selectedTagIds.join(","))
        formData.append("published", published ? "true" : "false")
        return updateLessonAction(lesson.id, formData)
      }
    : async (_prevState: unknown, formData: FormData) => {
        formData.append("tag_ids", selectedTagIds.join(","))
        formData.append("published", published ? "true" : "false")
        return createLessonAction(formData)
      }

  const [state, formAction] = useActionState(action, null)

  React.useEffect(() => {
    if (lesson) {
      setPublished(lesson.published ?? false)
    }
  }, [lesson])

  React.useEffect(() => {
    if (state?.success && state.data) {
      router.push(`/lessons/${state.data.id}`)
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Název lekce *</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
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
        <Label htmlFor="description">Popis lekce</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="publication_date">Datum publikování</Label>
          <Input
            id="publication_date"
            name="publication_date"
            type="date"
            value={publicationDate}
            onChange={(e) => setPublicationDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="period">Období</Label>
        <Input
          id="period"
          name="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder="např. 40. léta – 2. světová válka"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_group">Cílová skupina</Label>
        <Input
          id="target_group"
          name="target_group"
          value={targetGroup}
          onChange={(e) => setTargetGroup(e.target.value)}
          placeholder="např. 9. ročník ZŠ, střední školy"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson_type">Typ lekce</Label>
        <Input
          id="lesson_type"
          name="lesson_type"
          value={lessonType}
          onChange={(e) => setLessonType(e.target.value)}
          placeholder="např. Videovýpověď + reflexe + aktivita"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rvp_connection">Napojení na RVP (oddělené čárkami)</Label>
        <Textarea
          id="rvp_connection"
          name="rvp_connection"
          value={rvpConnection}
          onChange={(e) => setRvpConnection(e.target.value)}
          rows={3}
          placeholder="Dějepis - Moderní dějiny, Osobnostní a sociální výchova, Mediální výchova"
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="published"
          checked={published}
          onCheckedChange={(checked) => setPublished(checked === true)}
        />
        <Label htmlFor="published" className="cursor-pointer">
          Publikovat lekci (viditelná pro všechny)
        </Label>
      </div>

      <div className="flex gap-4">
        <Button type="submit">{isEditing ? "Uložit změny" : "Vytvořit lekci"}</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Zrušit
        </Button>
      </div>
    </form>
  )
}

