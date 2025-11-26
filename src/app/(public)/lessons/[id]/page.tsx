import { Suspense } from 'react'
import { LessonDetailContent } from '@/components/lessons/LessonDetailContent'

// Public route - can be statically generated for published lessons
// Uses public client (no cookies), RLS handles access control
// Admin controls are loaded client-side

function LessonDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="h-10 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="text-center py-12">
        <p className="text-gray-500">Načítání lekce...</p>
      </div>
    </div>
  )
}

interface LessonPageProps {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Suspense fallback={<LessonDetailLoading />}>
        <LessonDetailContent id={id} usePublicClient={true} />
      </Suspense>
    </div>
  )
}

