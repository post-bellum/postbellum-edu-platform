import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLessonById } from '@/lib/supabase/lessons'
import { isLessonFavorited } from '@/lib/supabase/favorites'
import { getUserLessonMaterials } from '@/lib/supabase/user-lesson-materials'
import { getUser } from '@/lib/supabase/auth-helpers'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import { LessonMaterialsWrapper } from '@/components/lessons/LessonMaterialsWrapper'
import { AdditionalActivitiesSection } from '@/components/lessons/AdditionalActivitiesSection'
import { AdminControls } from '@/components/lessons/AdminControls'
import { FavoriteButton } from '@/components/lessons/FavoriteButton'
import { FavoriteCTA } from '@/components/lessons/FavoriteCTA'
import { LessonVideoEmbed } from '@/components/lessons/LessonVideoEmbed'
import { LessonDetailInfo } from '@/components/lessons/LessonDetailInfo'

interface LessonDetailContentProps {
  id: string
  usePublicClient?: boolean // Use public client for static generation
}

export async function LessonDetailContent({ id, usePublicClient = false }: LessonDetailContentProps) {
  const [lesson, isFavorited, user, userMaterials] = await Promise.all([
    getLessonById(id, usePublicClient),
    // isLessonFavorited handles non-authenticated users gracefully (returns false)
    isLessonFavorited(id).catch(() => false),
    // Check if user is logged in - always check regardless of usePublicClient
    getUser().catch(() => null),
    // Fetch user's custom lesson materials
    getUserLessonMaterials(id).catch(() => [])
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 lg:w-0 space-y-6">
          {/* Video */}
          {lesson.vimeo_video_url && (
            <LessonVideoEmbed videoUrl={lesson.vimeo_video_url} title={lesson.title} />
          )}

          {/* Lesson Materials with User Custom Materials */}
          <LessonMaterialsWrapper
            materials={lesson.materials || []}
            initialUserMaterials={userMaterials}
            lessonId={id}
            isLoggedIn={!!user}
          />

          {/* Additional Activities */}
          <AdditionalActivitiesSection activities={lesson.additional_activities || []} />
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 lg:shrink-0 lg:sticky lg:top-20 lg:self-start">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <LessonDetailInfo lesson={lesson}>
              {/* Favorite Button or CTA */}
              {user ? (
                <FavoriteButton lessonId={id} initialIsFavorited={isFavorited} />
              ) : (
                <FavoriteCTA />
              )}
            </LessonDetailInfo>
          </div>
        </div>
      </div>
    </>
  )
}
