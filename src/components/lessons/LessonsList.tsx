import { getLessons } from '@/lib/supabase/lessons'
import { AdminControls } from '@/components/lessons/AdminControls'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { LessonCard } from './LessonCard'

export async function LessonsList() {
  // Check if user is admin to show unpublished lessons
  const admin = await isAdmin()

  // If admin, fetch all lessons (including unpublished) using authenticated client
  // Otherwise, fetch only published lessons using public client
  const lessons = await getLessons({
    published_only: !admin,
    usePublicClient: !admin,
    include_tags: true,
  })

  return (
    <div className="w-full mb-16">
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
          <AdminControls showNewButton isAdmin={admin} />
        </div>
      </div>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="text-center py-24 border border-grey-200 rounded-3xl bg-grey-50/50">
          <p className="text-text-subtle mb-6 text-lg">Zatím nejsou žádné lekce</p>
          <AdminControls showNewButton isAdmin={admin} />
        </div>
      ) : (
        <div className="flex flex-col gap-10 sm:gap-10">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} isAdmin={admin} />
          ))}
        </div>
      )}
    </div>
  )
}
