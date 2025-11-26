import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { EditLessonContent } from '@/components/lessons/EditLessonContent'

// Private route - requires admin authentication
export const dynamic = 'force-dynamic'

function EditLessonLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">Upravit lekci</h1>
      <div className="text-center py-12">
        <p className="text-gray-500">Načítání...</p>
      </div>
    </div>
  )
}

interface EditLessonPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id } = await params
  const admin = await isAdmin()
  
  if (!admin) {
    redirect(`/lessons/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">Upravit lekci</h1>
      <Suspense fallback={<EditLessonLoading />}>
        <EditLessonContent id={id} />
      </Suspense>
    </div>
  )
}

