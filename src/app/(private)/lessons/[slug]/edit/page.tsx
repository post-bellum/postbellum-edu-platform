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
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="bg-white border border-grey-200 rounded-[28px] shadow-sm h-48 animate-pulse"
        />
      ))}
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
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-8 pb-16">
      {/* Page Header */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-semibold leading-display text-text-strong">
          Upravit lekci
        </h1>
        <p className="mt-2 text-base text-text-subtle leading-body">
          Upravte informace o lekci a její obsah.
        </p>
      </div>

      {/* Form */}
      <React.Suspense fallback={<EditLessonLoading />}>
        <EditLessonContent id={id} />
      </React.Suspense>
    </div>
  )
}
