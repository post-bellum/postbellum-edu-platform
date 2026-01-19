import { notFound } from 'next/navigation'
import { getLessonById } from '@/lib/supabase/lessons'
import { isLessonFavorited } from '@/lib/supabase/favorites'
import { getUserLessonMaterials } from '@/lib/supabase/user-lesson-materials'
import { getUser } from '@/lib/supabase/auth-helpers'
import { Button } from '@/components/ui/Button'
import { Lightbulb } from 'lucide-react'
import { Breadcrumbs } from '@/components/lessons/Breadcrumbs'
import { LessonDetailHeader } from '@/components/lessons/LessonDetailHeader'
import { LessonMaterialsWrapper } from '@/components/lessons/LessonMaterialsWrapper'
import { AdditionalActivitiesSection } from '@/components/lessons/AdditionalActivitiesSection'
import { FavoriteButton } from '@/components/lessons/FavoriteButton'
import { FavoriteCTA } from '@/components/lessons/FavoriteCTA'
import { LessonVideoEmbed } from '@/components/lessons/LessonVideoEmbed'
import { LessonDetailInfo } from '@/components/lessons/LessonDetailInfo'

interface LessonDetailContentProps {
  id: string
  usePublicClient?: boolean // Use public client for static generation
}

export async function LessonDetailContent({ id, usePublicClient = false }: LessonDetailContentProps) {
  // First fetch the lesson (id could be short_id or UUID)
  // This works because getLessonById is smart and detects which one it is
  const lesson = await getLessonById(id, usePublicClient)

  // RLS policies ensure that:
  // - Public users can only access published lessons (getLessonById returns null for unpublished)
  // - Authenticated users can access all lessons
  // So if lesson is null, it means either it doesn't exist or user doesn't have access
  if (!lesson) {
    notFound()
  }

  // Now fetch related data using the lesson's actual UUID
  // (favorites and user materials tables use UUID, not short_id)
  const [isFavorited, user, userMaterials] = await Promise.all([
    // isLessonFavorited handles non-authenticated users gracefully (returns false)
    isLessonFavorited(lesson.id).catch(() => false),
    // Check if user is logged in - always check regardless of usePublicClient
    getUser().catch(() => null),
    // Fetch user's custom lesson materials
    getUserLessonMaterials(lesson.id).catch(() => [])
  ])

  const breadcrumbItems = [
    { label: 'Domov', href: '/' },
    { label: 'Katalog lekcí', href: '/lessons' },
    { label: 'Detail lekce' },
  ]

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumbs items={breadcrumbItems} />
      
      <LessonDetailHeader 
        lessonId={lesson.id} 
        title={lesson.title} 
        published={lesson.published} 
      />

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <div className="flex-1 lg:w-0 space-y-10">
          {/* Video */}
          {lesson.vimeo_video_url && (
            <LessonVideoEmbed videoUrl={lesson.vimeo_video_url} title={lesson.title} />
          )}

          {/* Lesson Materials with User Custom Materials */}
          <LessonMaterialsWrapper
            materials={lesson.materials || []}
            initialUserMaterials={userMaterials}
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            lessonShortId={lesson.short_id}
            isLoggedIn={!!user}
          />

          {/* Additional Activities */}
          <AdditionalActivitiesSection activities={lesson.additional_activities || []} />
        </div>

        {/* Sidebar */}
        <div className="lg:w-[340px] lg:shrink-0 space-y-6">
          {/* Lesson Info Card */}
          <div className="rounded-[28px] p-6">
            <LessonDetailInfo lesson={lesson} />
          </div>

          {/* Side Action Buttons */}
          <div className="flex flex-col gap-1.5 px-6">
            {user ? (
              <FavoriteButton 
                lessonId={lesson.id} 
                initialIsFavorited={isFavorited}
                variant="sidebar"
              />
            ) : (
              <FavoriteCTA variant="sidebar" />
            )}
            <Button variant="secondary" size="medium" className="w-full justify-center">
              <Lightbulb className="w-5 h-5" />
              Poslat návrh na zlepšení
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
