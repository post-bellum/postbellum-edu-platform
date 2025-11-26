import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { getTags } from '@/lib/supabase/tags'
import { LessonForm } from '@/components/lessons/LessonForm'

export default async function NewLessonPage() {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }

  const tags = await getTags()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Nová lekce</h1>
      <LessonForm tags={tags} />
    </div>
  )
}

