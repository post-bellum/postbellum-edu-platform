import Link from 'next/link'
import { getLessons } from '@/lib/supabase/lessons'
import { AdminControls } from '@/components/lessons/AdminControls'
import { isAdmin } from '@/lib/supabase/admin-helpers'

export async function LessonsList() {
  // Check if user is admin to show unpublished lessons
  const admin = await isAdmin()
  
  // If admin, fetch all lessons (including unpublished) using authenticated client
  // Otherwise, fetch only published lessons using public client
  const lessons = await getLessons({ 
    published_only: !admin, 
    usePublicClient: !admin 
  })

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Lekce</h1>
          <p className="text-gray-600">Správa vzdělávacích lekcí</p>
        </div>
        <AdminControls showNewButton />
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">Zatím nejsou žádné lekce</p>
          <AdminControls showNewButton />
        </div>
      ) : (
        <div className="grid gap-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`p-6 border rounded-lg hover:border-primary hover:shadow-md transition-all ${
                !lesson.published 
                  ? 'border-orange-300 bg-orange-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <Link href={`/lessons/${lesson.id}`} className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">{lesson.title}</h2>
                    {!lesson.published && (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-200 text-orange-800 rounded">
                        Nepublikováno
                      </span>
                    )}
                  </div>
                  {lesson.description && (
                    <p className="text-gray-600 mb-2 line-clamp-2">{lesson.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    {lesson.period && <span>{lesson.period}</span>}
                    {lesson.duration && <span>• {lesson.duration}</span>}
                    {lesson.target_group && <span>• {lesson.target_group}</span>}
                    {lesson.publication_date && (
                      <span>• Publikováno: {new Date(lesson.publication_date).toLocaleDateString('cs-CZ')}</span>
                    )}
                  </div>
                </Link>
                <AdminControls lessonId={lesson.id} lessonTitle={lesson.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
