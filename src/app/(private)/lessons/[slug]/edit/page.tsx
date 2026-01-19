import * as React from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { getLessonById } from '@/lib/supabase/lessons'
import { generateLessonUrlFromLesson, extractLessonId } from '@/lib/utils'
import { EditLessonContent } from '@/components/lessons/EditLessonContent'

// Private route - requires admin authentication
export const dynamic = 'force-dynamic'

function EditLessonLoading() {
  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
        <h1 className="text-4xl font-bold">Upravit lekci</h1>
        <div className="text-center py-12">
          <p className="text-gray-500">Načítání...</p>
        </div>
    </div>
  )
}

interface EditLessonPageProps {
  params: Promise<{ slug: string }>
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { slug } = await params
  const id = extractLessonId(slug)
  const admin = await isAdmin()
  
  if (!admin) {
    // Fetch lesson to get title for SEO-friendly redirect
    const lesson = await getLessonById(id)
    if (lesson) {
      redirect(generateLessonUrlFromLesson(lesson))
    } else {
      // If lesson not found, redirect to lessons list
      redirect('/lessons')
    }
  }

  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
        <h1 className="text-4xl font-bold">Upravit lekci</h1>
        <React.Suspense fallback={<EditLessonLoading />}>
          <EditLessonContent id={id} />
        </React.Suspense>
    </div>
  )
}
