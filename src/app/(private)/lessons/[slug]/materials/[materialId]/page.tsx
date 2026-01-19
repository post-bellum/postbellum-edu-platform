import * as React from 'react'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth-helpers'
import { getUserLessonMaterialById } from '@/lib/supabase/user-lesson-materials'
import { getLessonById } from '@/lib/supabase/lessons'
import { generateLessonUrlFromLesson, extractLessonId } from '@/lib/utils'
import { UserMaterialEditContent } from '@/components/lessons/UserMaterialEditContent'

interface UserMaterialEditPageProps {
  params: Promise<{ slug: string; materialId: string }>
}

export default async function UserMaterialEditPage({ params }: UserMaterialEditPageProps) {
  const { slug, materialId } = await params
  const lessonId = extractLessonId(slug)

  // Check if user is authenticated
  const user = await getUser()
  
  if (!user) {
    redirect('/lessons')
  }

  // Fetch the material first
  const material = await getUserLessonMaterialById(materialId)

  if (!material) {
    notFound()
  }

  // Verify the material belongs to the current user
  if (material.user_id !== user.id) {
    notFound()
  }

  // Try to fetch the lesson using the extracted lessonId from URL
  let lesson = await getLessonById(lessonId)
  
  // If lesson not found with URL param, try using material's lesson_id (fallback for UUID-based URLs)
  if (!lesson && lessonId !== material.lesson_id) {
    lesson = await getLessonById(material.lesson_id)
  }

  // If still no lesson, the lesson might be deleted or inaccessible
  if (!lesson) {
    notFound()
  }

  // Ensure the material actually belongs to this lesson
  if (material.lesson_id !== lesson.id) {
    notFound()
  }

  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
      <UserMaterialEditContent
        material={material}
        lesson={lesson}
      />
    </div>
  )
}
