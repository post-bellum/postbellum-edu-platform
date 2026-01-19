import * as React from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { NewLessonContent } from '@/components/lessons/NewLessonContent'

// Private route - requires admin authentication
export const dynamic = 'force-dynamic'

function NewLessonLoading() {
  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Nová lekce</h1>
        <div className="text-center py-12">
          <p className="text-gray-500">Načítání...</p>
        </div>
      </div>
    </div>
  )
}

export default async function NewLessonPage() {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/lessons')
  }

  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Nová lekce</h1>
        <React.Suspense fallback={<NewLessonLoading />}>
          <NewLessonContent />
        </React.Suspense>
      </div>
    </div>
  )
}
