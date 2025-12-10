import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLessonById } from '@/lib/supabase/lessons'
import { isLessonFavorited } from '@/lib/supabase/favorites'
import { getUser } from '@/lib/supabase/auth-helpers'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import { LessonMaterialsSection } from '@/components/lessons/LessonMaterialsSection'
import { AdditionalActivitiesSection } from '@/components/lessons/AdditionalActivitiesSection'
import { AdminControls } from '@/components/lessons/AdminControls'
import { FavoriteButton } from '@/components/lessons/FavoriteButton'
import { FavoriteCTA } from '@/components/lessons/FavoriteCTA'

interface LessonDetailContentProps {
  id: string
  usePublicClient?: boolean // Use public client for static generation
}

export async function LessonDetailContent({ id, usePublicClient = false }: LessonDetailContentProps) {
  const [lesson, isFavorited, user] = await Promise.all([
    getLessonById(id, usePublicClient),
    // isLessonFavorited handles non-authenticated users gracefully (returns false)
    isLessonFavorited(id).catch(() => false),
    // Check if user is logged in - always check regardless of usePublicClient
    getUser().catch(() => null)
  ])

  // RLS policies ensure that:
  // - Public users can only access published lessons (getLessonById returns null for unpublished)
  // - Authenticated users can access all lessons
  // So if lesson is null, it means either it doesn't exist or user doesn't have access
  if (!lesson) {
    notFound()
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href="/lessons">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft />
            Zpět na seznam lekcí
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">{lesson.title}</h1>
            {!lesson.published && (
              <span className="px-3 py-1 text-sm font-medium bg-orange-200 text-orange-800 rounded">
                Nepublikováno
              </span>
            )}
          </div>
          {/* AdminControls handles its own visibility via client-side admin check */}
          <AdminControls lessonId={id} lessonTitle={lesson.title} showEditButton={true} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video */}
          {lesson.vimeo_video_url && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={lesson.vimeo_video_url}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
                title={lesson.title}
              />
            </div>
          )}

          {/* Lesson Materials */}
          <LessonMaterialsSection materials={lesson.materials || []} />

          {/* Additional Activities */}
          <AdditionalActivitiesSection activities={lesson.additional_activities || []} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Základní informace o lekci</h2>
            
            {lesson.description && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Popis lekce</h3>
                <p className="text-gray-600 text-sm">{lesson.description}</p>
              </div>
            )}

            {lesson.duration && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Délka lekce</h3>
                <p className="text-gray-600 text-sm">{lesson.duration}</p>
              </div>
            )}

            {lesson.rvp_connection && lesson.rvp_connection.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Napojení na RVP</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  {lesson.rvp_connection.map((rvp: string, idx: number) => (
                    <li key={idx}>{rvp}</li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.period && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Období</h3>
                <p className="text-gray-600 text-sm">{lesson.period}</p>
              </div>
            )}

            {lesson.target_group && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Cílová skupina</h3>
                <p className="text-gray-600 text-sm">{lesson.target_group}</p>
              </div>
            )}

            {lesson.lesson_type && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Typ lekce</h3>
                <p className="text-gray-600 text-sm">{lesson.lesson_type}</p>
              </div>
            )}

            {lesson.publication_date && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Datum publikování lekce</h3>
                <p className="text-gray-600 text-sm">
                  {new Date(lesson.publication_date).toLocaleDateString('cs-CZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {lesson.tags && lesson.tags.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Tagy</h3>
                <div className="flex flex-wrap gap-2">
                  {lesson.tags.map((tag: { id: string; title: string }) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Button or CTA */}
            {user ? (
              <div className="pt-4 border-t">
                <FavoriteButton lessonId={id} initialIsFavorited={isFavorited} />
              </div>
            ) : (
              <FavoriteCTA />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
