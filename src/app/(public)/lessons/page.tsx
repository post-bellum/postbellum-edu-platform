import { LessonsList } from '@/components/lessons/LessonsList'

// Public route - can be statically generated
// Uses public client (no cookies), RLS handles filtering to published lessons only
// Admin controls are loaded client-side

export default function LessonsPage() {
  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
      <LessonsList />
    </div>
  )
}
