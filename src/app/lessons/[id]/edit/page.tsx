import { notFound, redirect } from 'next/navigation'
import { getLessonById } from '@/lib/supabase/lessons'
import { getTags } from '@/lib/supabase/tags'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { LessonForm } from '@/components/lessons/LessonForm'

interface EditLessonPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const { id } = await params
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }

  const [lesson, tags] = await Promise.all([
    getLessonById(id),
    getTags()
  ])

  if (!lesson) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Upravit lekci</h1>
      <LessonForm lesson={lesson} tags={tags} />
    </div>
  )
}

