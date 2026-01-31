import * as React from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { NewLessonContent } from '@/components/lessons/NewLessonContent'

// Private route - requires admin authentication
export const dynamic = 'force-dynamic'

function NewLessonLoading() {
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

export default async function NewLessonPage() {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/lessons')
  }

  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-8 pb-16">
      {/* Page Header */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-semibold leading-display text-text-strong">
          Nová lekce
        </h1>
        <p className="mt-2 text-base text-text-subtle leading-body">
          Vytvořte novou vzdělávací lekci pro platformu.
        </p>
      </div>

      {/* Form */}
      <React.Suspense fallback={<NewLessonLoading />}>
        <NewLessonContent />
      </React.Suspense>
    </div>
  )
}
