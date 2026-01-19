import { notFound } from 'next/navigation'
import { getLessonById } from '@/lib/supabase/lessons'
import { getTags } from '@/lib/supabase/tags'
import { LessonForm } from '@/components/lessons/LessonForm'
import { LessonMaterialsManager } from '@/components/lessons/LessonMaterialsManager'
import { AdditionalActivitiesManager } from '@/components/lessons/AdditionalActivitiesManager'

interface EditLessonContentProps {
  id: string
}

export async function EditLessonContent({ id }: EditLessonContentProps) {
  const [lesson, tags] = await Promise.all([
    getLessonById(id),
    getTags()
  ])

  if (!lesson) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Základní informace</h2>
        <LessonForm lesson={lesson} tags={tags} />
      </div>

      <div className="border-t pt-6">
        <LessonMaterialsManager
          lessonId={lesson.id}
          initialMaterials={lesson.materials || []}
        />
      </div>

      <div className="border-t pt-6">
        <AdditionalActivitiesManager
          lessonId={lesson.id}
          initialActivities={lesson.additional_activities || []}
        />
      </div>
    </div>
  )
}
