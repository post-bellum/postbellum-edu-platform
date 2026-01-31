import { notFound } from 'next/navigation'
import { getLessonById } from '@/lib/supabase/lessons'
import { getTags } from '@/lib/supabase/tags'
import { LessonForm } from '@/components/lessons/LessonForm'
import { LessonMaterialsManager } from '@/components/lessons/LessonMaterialsManager'
import { AdditionalActivitiesManager } from '@/components/lessons/AdditionalActivitiesManager'
import { DeleteLessonButton } from '@/components/lessons/DeleteLessonButton'

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

      {/* Materials & Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-[28px] overflow-hidden">
        <div className="px-5 py-6 sm:px-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-red-800">Nebezpečná zóna</h3>
              <p className="text-sm text-red-700 mt-1">
                Smazání lekce je nevratné a odstraní také všechny související materiály a aktivity.
              </p>
            </div>
            <div className="sm:shrink-0">
              <DeleteLessonButton lessonId={lesson.id} lessonTitle={lesson.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
