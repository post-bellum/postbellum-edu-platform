'use client'

import * as React from 'react'
import { UserEditedMaterialsList } from './UserEditedMaterialsList'
import type { UserLessonMaterial } from '@/types/lesson.types'

interface UserEditedMaterialsSectionProps {
  initialMaterials: Array<UserLessonMaterial & { lesson_title: string }>
  onDelete?: (materialId: string, lessonId: string) => Promise<void>
  onDuplicate?: (materialId: string, lessonId: string) => Promise<void>
}

export function UserEditedMaterialsSection({ initialMaterials, onDelete, onDuplicate }: UserEditedMaterialsSectionProps) {
  return (
    <div>
      <UserEditedMaterialsList 
        materials={initialMaterials} 
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  )
}

