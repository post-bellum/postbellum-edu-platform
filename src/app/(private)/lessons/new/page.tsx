import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { NewLessonContent } from '@/components/lessons/NewLessonContent'

// Private route - requires admin authentication
export const dynamic = 'force-dynamic'

function NewLessonLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Nová lekce</h1>
      <div className="text-center py-12">
        <p className="text-gray-500">Načítání...</p>
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Nová lekce</h1>
      <Suspense fallback={<NewLessonLoading />}>
        <NewLessonContent />
      </Suspense>
    </div>
  )
}

