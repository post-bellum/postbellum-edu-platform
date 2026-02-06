import Link from 'next/link'
import { AdminControls } from '@/components/lessons/AdminControls'
import { ViewButton } from '@/components/ui/ViewButton'
import { LessonThumbnail } from './LessonThumbnail'
import type { LessonWithRelations, Tag } from '@/types/lesson.types'
import { generateLessonUrlFromLesson } from '@/lib/utils'

export function LessonTag({ tag }: { tag: Tag }) {
  return (
    <span className="inline-flex items-center justify-center px-3 py-2 bg-grey-50 border border-black/5 rounded-full text-sm font-semibold text-text-subtle leading-4">
      {tag.title}
    </span>
  )
}

interface LessonCardProps {
  lesson: LessonWithRelations
  isAdmin?: boolean
  showAdminControls?: boolean
}

export function LessonCard({ lesson, isAdmin = false, showAdminControls = true }: LessonCardProps) {
  const tags = lesson.tags || []
  const lessonUrl = generateLessonUrlFromLesson(lesson)

  return (
    <article className="flex flex-col sm:flex-row gap-5 sm:gap-6 md:gap-8 items-start group">
      {/* Thumbnail */}
      <Link
        href={lessonUrl}
        className="relative w-full sm:w-[200px] md:w-[260px] lg:w-[316px] aspect-[16/10] sm:aspect-auto sm:h-[130px] md:h-[170px] lg:h-[200px] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shrink-0 bg-linear-to-br from-grey-100 to-grey-200"
      >
        <LessonThumbnail
          src={lesson.thumbnail_url}
          alt={lesson.title}
        />
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-5 sm:gap-5 md:gap-7 sm:py-3 md:py-5 min-w-0">
        <div className="flex flex-col gap-3">
          {/* Title with unpublished badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={lessonUrl}>
              <h2 className="text-xl font-semibold text-text-strong leading-display group-hover:text-brand-primary transition-colors">
                {lesson.title}
              </h2>
            </Link>
            {!lesson.published && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-200 text-orange-800 rounded">
                Nepublikováno
              </span>
            )}
          </div>

          {/* Description */}
          {lesson.description && (
            <p className="text-xs sm:text-sm text-text-subtle leading-body-sm line-clamp-2 max-w-[800px]">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 max-w-[400px] sm:max-w-[480px]">
            {tags.slice(0, 5).map((tag) => (
              <LessonTag key={tag.id} tag={tag} />
            ))}
            {tags.length > 5 && (
              <span className="inline-flex items-center px-3 py-2 text-sm text-text-subtle">
                +{tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Desktop Actions */}
      <div className="hidden sm:flex flex-col items-center justify-center self-stretch shrink-0 gap-2">
        <ViewButton href={lessonUrl} />
        {showAdminControls && isAdmin && <div className="w-12 h-px bg-grey-200" />}
        {showAdminControls && (
          <AdminControls 
            lessonId={lesson.id} 
            lessonShortId={lesson.short_id} 
            lessonTitle={lesson.title} 
            isAdmin={isAdmin}
          />
        )}
      </div>
    </article>
  )
}
