import * as React from 'react'
import { LessonDetailContent } from '@/components/lessons/LessonDetailContent'
import { isAdmin } from '@/lib/supabase/admin-helpers'

// Public route - can be statically generated for published lessons
// For admins, uses authenticated client to access unpublished lessons
// For non-admins, uses public client (no cookies), RLS handles access control
// Admin controls are loaded client-side

function LessonDetailLoading() {
  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
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
  
  // Check if user is admin to determine which client to use
  // Admins need authenticated client to see unpublished lessons
  const admin = await isAdmin()
  const usePublicClient = !admin

  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
      <React.Suspense fallback={<LessonDetailLoading />}>
        <LessonDetailContent id={id} usePublicClient={usePublicClient} />
      </React.Suspense>
    </div>
  )
}
