'use client'

import * as React from 'react'
import { LessonMaterial, UserLessonMaterial } from '@/types/lesson.types'
import { LessonMaterialsSection } from './LessonMaterialsSection'
import { UserLessonMaterialsSection } from './UserLessonMaterialsSection'

interface LessonMaterialsWrapperProps {
  materials: LessonMaterial[]
  initialUserMaterials: UserLessonMaterial[]
  lessonId: string
  lessonTitle: string
  lessonShortId?: string | null
  isLoggedIn: boolean
}

export function LessonMaterialsWrapper({
  materials,
  initialUserMaterials,
  lessonId,
  lessonTitle,
  lessonShortId,
  isLoggedIn,
}: LessonMaterialsWrapperProps) {
  const [userMaterials, setUserMaterials] = React.useState<UserLessonMaterial[]>(initialUserMaterials)

  const handleMaterialCreated = (material: UserLessonMaterial) => {
    setUserMaterials((prev) => [material, ...prev])
  }

  const handleMaterialDeleted = (materialId: string) => {
    setUserMaterials((prev) => prev.filter((m) => m.id !== materialId))
  }

  return (
    <>
      {/* Lesson Materials */}
      <LessonMaterialsSection
        materials={materials}
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        lessonShortId={lessonShortId}
        onMaterialCreated={handleMaterialCreated}
      />

      {/* User's Custom Materials */}
      {isLoggedIn && userMaterials.length > 0 && (
        <UserLessonMaterialsSection
          materials={userMaterials}
          lessonId={lessonId}
          lessonTitle={lessonTitle}
          lessonShortId={lessonShortId}
          onMaterialDeleted={handleMaterialDeleted}
        />
      )}
    </>
  )
}
