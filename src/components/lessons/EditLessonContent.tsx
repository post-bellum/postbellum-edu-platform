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
    <div className="space-y-8">
      {/* Lesson Form */}
      <LessonForm lesson={lesson} tags={tags} />

      {/* Materials Section */}
      <div className="bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden">
        <div className="px-5 py-7 sm:px-7">
          <LessonMaterialsManager
            lessonId={lesson.id}
            initialMaterials={lesson.materials || []}
          />
        </div>
      </div>

      {/* Additional Activities Section */}
      <div className="bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden">
        <div className="px-5 py-7 sm:px-7">
          <AdditionalActivitiesManager
            lessonId={lesson.id}
            initialActivities={lesson.additional_activities || []}
          />
        </div>
      </div>
    </div>
  )
}
