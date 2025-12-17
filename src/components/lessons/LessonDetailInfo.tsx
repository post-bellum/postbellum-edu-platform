import * as React from 'react'
import { formatDateLong } from '@/lib/utils'
import type { LessonWithRelations } from '@/types/lesson.types'

interface LessonDetailInfoProps {
  lesson: LessonWithRelations
  children?: React.ReactNode
  variant?: 'default' | 'compact'
}

export function LessonDetailInfo({ lesson, children, variant = 'default' }: LessonDetailInfoProps) {
  const isCompact = variant === 'compact'
  const titleClass = isCompact ? 'text-lg' : 'text-xl'
  const headingClass = isCompact ? 'text-sm' : 'font-medium'
  const tagClass = isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
  const titleMargin = isCompact ? 'mb-3' : 'mb-4'
  const headingMargin = isCompact ? 'mb-1' : 'mb-2'

  return (
    <>
      <h2 className={`${titleClass} font-semibold ${titleMargin}`}>
        Základní informace o lekci
      </h2>
      
      {lesson.description && (
        <div className="mb-4">
          <h3 className={`${headingClass} ${headingMargin}`}>Popis lekce</h3>
          <p className="text-gray-600 text-sm">{lesson.description}</p>
        </div>
      )}

      {lesson.duration && (
        <div className="mb-4">
          <h3 className={`${headingClass} ${headingMargin}`}>Délka lekce</h3>
          <p className="text-gray-600 text-sm">{lesson.duration}</p>
        </div>
      )}

      {lesson.rvp_connection && lesson.rvp_connection.length > 0 && (
        <div className="mb-4">
          <h3 className={`${headingClass} ${headingMargin}`}>Napojení na RVP</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            {lesson.rvp_connection.map((rvp: string, idx: number) => (
              <li key={idx}>{rvp}</li>
            ))}
          </ul>
        </div>
      )}

      {lesson.period && (
        <div className="mb-4">
          <h3 className={`${headingClass} ${headingMargin}`}>Období</h3>
          <p className="text-gray-600 text-sm">{lesson.period}</p>
        </div>
      )}

      {lesson.target_group && (
        <div className="mb-4">
          <h3 className={`${headingClass} ${headingMargin}`}>Cílová skupina</h3>
          <p className="text-gray-600 text-sm">{lesson.target_group}</p>
        </div>
      )}

      {lesson.lesson_type && (
        <div className="mb-4">
          <h3 className={`${headingClass} ${headingMargin}`}>Typ lekce</h3>
          <p className="text-gray-600 text-sm">{lesson.lesson_type}</p>
        </div>
      )}

      {lesson.publication_date && (
        <div className="mb-4">
          <h3 className={`${headingClass} ${headingMargin}`}>Datum publikování lekce</h3>
          <p className="text-gray-600 text-sm">
            {formatDateLong(lesson.publication_date)}
          </p>
        </div>
      )}

      {lesson.tags && lesson.tags.length > 0 && (
        <div className={children ? 'mb-4' : ''}>
          <h3 className={`${headingClass} mb-2`}>Tagy</h3>
          <div className="flex flex-wrap gap-2">
            {lesson.tags.map((tag: { id: string; title: string }) => (
              <span
                key={tag.id}
                className={`${tagClass} bg-gray-100 text-gray-700 rounded-full`}
              >
                {tag.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {children && (
        <div className="pt-4 border-t">
          {children}
        </div>
      )}
    </>
  )
}
