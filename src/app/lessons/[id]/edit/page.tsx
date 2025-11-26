import { notFound, redirect } from 'next/navigation'
import { getLessonById } from '@/lib/supabase/lessons'
import { getTags } from '@/lib/supabase/tags'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { LessonForm } from '@/components/lessons/LessonForm'
import { LessonMaterialsManager } from '@/components/lessons/LessonMaterialsManager'
import { AdditionalActivitiesManager } from '@/components/lessons/AdditionalActivitiesManager'

interface EditLessonPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id } = await params
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }

  const [lesson, tags] = await Promise.all([
    getLessonById(id),
    getTags()
  ])

  if (!lesson) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">Upravit lekci</h1>
      
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
    </div>
  )
}

