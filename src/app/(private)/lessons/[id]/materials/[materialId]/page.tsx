import * as React from 'react'
import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth-helpers'
import { getUserLessonMaterialById } from '@/lib/supabase/user-lesson-materials'
import { getLessonById } from '@/lib/supabase/lessons'
import { UserMaterialEditContent } from '@/components/lessons/UserMaterialEditContent'

interface UserMaterialEditPageProps {
  params: Promise<{ id: string; materialId: string }>
}

export default async function UserMaterialEditPage({ params }: UserMaterialEditPageProps) {
  const { id: lessonId, materialId } = await params

  // Check if user is authenticated
  const user = await getUser()
  if (!user) {
    redirect(`/lessons/${lessonId}`)
  }

  // Fetch the material and lesson in parallel
  const [material, lesson] = await Promise.all([
    getUserLessonMaterialById(materialId),
    getLessonById(lessonId),
  ])

  if (!material || !lesson) {
    notFound()
  }

  // Ensure the material belongs to this lesson
  if (material.lesson_id !== lessonId) {
    notFound()
  }

  // Verify the material belongs to the current user
  if (material.user_id !== user.id) {
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
