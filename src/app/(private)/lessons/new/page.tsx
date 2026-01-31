import * as React from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { NewLessonContent } from '@/components/lessons/NewLessonContent'
import { FormSkeleton } from '@/components/ui/skeleton'

// Private route - requires admin authentication
export const dynamic = 'force-dynamic'

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
      <React.Suspense fallback={<FormSkeleton />}>
        <NewLessonContent />
      </React.Suspense>
    </div>
  )
}
