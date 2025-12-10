'use client'

import * as React from 'react'
import { LessonVideoEmbed } from './LessonVideoEmbed'
import { LessonDetailInfo } from './LessonDetailInfo'
import type { LessonWithRelations } from '@/types/lesson.types'

interface MaterialEditSidebarProps {
  lesson: LessonWithRelations
}

export function MaterialEditSidebar({ lesson }: MaterialEditSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Video Preview */}
      {lesson.vimeo_video_url && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Náhled videa</h2>
          <LessonVideoEmbed videoUrl={lesson.vimeo_video_url} title={lesson.title} />
        </div>
      )}

      {/* Lesson Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <LessonDetailInfo lesson={lesson} variant="compact" />
      </div>
    </div>
  )
}
