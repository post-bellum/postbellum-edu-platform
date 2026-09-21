import { Suspense } from 'react'
import { LessonsList } from '@/components/lessons/LessonsList'
import { DeletedLessonFeedback } from '@/components/lessons/DeletedLessonFeedback'

// LessonsList uses isAdmin() which needs cookies - must be dynamically rendered
export const dynamic = 'force-dynamic'

// Public route - shows published lessons; admin sees unpublished via client check
// Uses public client (no cookies), RLS handles filtering to published lessons only
// Admin controls are loaded client-side

export default function LessonsPage() {
  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
      <Suspense fallback={null}>
        <DeletedLessonFeedback />
      </Suspense>
      <LessonsList />
    </div>
  )
}
