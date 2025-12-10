import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { getTags } from '@/lib/supabase/tags'
import { LessonForm } from '@/components/lessons/LessonForm'

export async function NewLessonContent() {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }

  const tags = await getTags()

  return <LessonForm tags={tags} />
}
