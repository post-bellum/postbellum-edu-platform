import { LessonsList } from '@/components/lessons/LessonsList'

// Public route - can be statically generated
// Uses public client (no cookies), RLS handles filtering to published lessons only
// Admin controls are loaded client-side

export default function LessonsPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <LessonsList />
    </div>
  )
}

