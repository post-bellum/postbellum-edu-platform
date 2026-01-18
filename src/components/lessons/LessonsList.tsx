import Link from 'next/link'
import Image from 'next/image'
import { getLessons } from '@/lib/supabase/lessons'
import { AdminControls } from '@/components/lessons/AdminControls'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { EyeIcon } from '@/components/ui/Icons'
import type { LessonWithRelations, Tag } from '@/types/lesson.types'

function LessonTag({ tag }: { tag: Tag }) {
  return (
    <span className="inline-flex items-center justify-center px-3 py-2 bg-grey-50 border border-black/5 rounded-full text-sm font-semibold text-text-subtle leading-4">
      {tag.title}
    </span>
  )
}

function LessonCard({ lesson }: { lesson: LessonWithRelations }) {
  const tags = lesson.tags || []

  return (
    <article className="flex flex-col sm:flex-row gap-5 sm:gap-6 md:gap-8 items-start group">
      {/* Thumbnail */}
      <Link
        href={`/lessons/${lesson.id}`}
        className="relative w-[189px] sm:w-[200px] md:w-[260px] lg:w-[316px] h-[120px] sm:h-[130px] md:h-[170px] lg:h-[200px] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden border border-black/5 shrink-0 bg-linear-to-br from-grey-100 to-grey-200"
      >
        {lesson.thumbnail_url ? (
          <Image
            src={lesson.thumbnail_url}
            alt={lesson.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 189px, (max-width: 768px) 200px, (max-width: 1024px) 260px, 316px"
          />
        ) : (
          /* Placeholder pattern when no thumbnail */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-grey-300/50" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-5 sm:gap-5 md:gap-7 sm:py-3 md:py-5 min-w-0">
        <div className="flex flex-col gap-3">
          {/* Title with unpublished badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/lessons/${lesson.id}`}>
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

      {/* Mobile View Button */}
      <Link
        href={`/lessons/${lesson.id}`}
        className="flex sm:hidden items-center justify-center gap-1 px-4 py-1.5 bg-white border border-grey-200 rounded-full shadow-sm hover:bg-grey-50 transition-colors"
      >
        <EyeIcon className="w-5 h-5 text-grey-500" />
        <span className="text-sm font-semibold text-text-strong leading-7">Zobrazit</span>
      </Link>

      {/* Desktop Actions */}
      <div className="hidden sm:flex flex-col items-center justify-center self-stretch shrink-0 gap-2">
        <Link
          href={`/lessons/${lesson.id}`}
          className="flex items-center justify-center w-[52px] md:w-[60px] h-[40px] md:h-[44px] bg-white border border-grey-200 rounded-full shadow-sm hover:bg-grey-50 transition-colors"
          title="Zobrazit lekci"
        >
          <EyeIcon className="w-5 h-5 text-grey-500" />
        </Link>
        <AdminControls lessonId={lesson.id} lessonTitle={lesson.title} />
      </div>
    </article>
  )
}

export async function LessonsList() {
  // Check if user is admin to show unpublished lessons
  const admin = await isAdmin()

  // If admin, fetch all lessons (including unpublished) using authenticated client
  // Otherwise, fetch only published lessons using public client
  const lessons = (await getLessons({
    published_only: !admin,
    usePublicClient: !admin,
    include_tags: true,
  })) as LessonWithRelations[]

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-4 pb-16 md:pb-20 lg:pb-24 pt-10">
        <div className="flex gap-4 items-start">
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-text-strong leading-display">
              Katalog lekcí
            </h1>
            <p className="text-md text-text-subtle leading-normal">
              Vyberte si lekci podle období nebo tématu.
            </p>
          </div>
          <AdminControls showNewButton />
        </div>
      </div>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="text-center py-24 border border-grey-200 rounded-3xl bg-grey-50/50">
          <p className="text-text-subtle mb-6 text-lg">Zatím nejsou žádné lekce</p>
          <AdminControls showNewButton />
        </div>
      ) : (
        <div className="flex flex-col gap-10 sm:gap-10">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  )
}
