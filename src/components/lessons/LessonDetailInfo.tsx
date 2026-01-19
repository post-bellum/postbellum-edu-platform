import * as React from 'react'
import { formatDateLong } from '@/lib/utils'
import type { LessonWithRelations } from '@/types/lesson.types'

interface LessonDetailInfoProps {
  lesson: LessonWithRelations
  children?: React.ReactNode
  variant?: 'default' | 'compact'
}

interface InfoBlockProps {
  label: string
  children: React.ReactNode
}

function InfoBlock({ label, children }: InfoBlockProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-md font-semibold text-text-strong">{label}</h3>
      <div className="text-md text-text-subtle leading-body">{children}</div>
    </div>
  )
}

export function LessonDetailInfo({ lesson, children, variant = 'default' }: LessonDetailInfoProps) {
  const isCompact = variant === 'compact'

  return (
    <div className="flex flex-col gap-8">
      {/* Section Title */}
      <h2 className={`${isCompact ? 'text-lg' : 'text-xl'} font-semibold text-text-strong leading-display`}>
        Základní informace o lekci
      </h2>

      {/* Info Items */}
      <div className="flex flex-col gap-6">
        {lesson.period && (
          <InfoBlock label="Období">
            <p>{lesson.period}</p>
          </InfoBlock>
        )}
        
        {lesson.description && (
          <InfoBlock label="Popis lekce">
            <p>{lesson.description}</p>
          </InfoBlock>
        )}

        {lesson.rvp_connection && lesson.rvp_connection.length > 0 && (
          <InfoBlock label="Napojení na RVP">
            <ul className="list-disc list-inside space-y-1">
              {lesson.rvp_connection.map((rvp: string, idx: number) => (
                <li key={idx}>{rvp}</li>
              ))}
            </ul>
          </InfoBlock>
        )}

        {lesson.publication_date && (
          <InfoBlock label="Datum publikování lekce">
            <p>{formatDateLong(lesson.publication_date)}</p>
          </InfoBlock>
        )}

        {lesson.duration && (
          <InfoBlock label="Délka lekce">
            <p>{lesson.duration}</p>
          </InfoBlock>
        )}

        {lesson.target_group && (
          <InfoBlock label="Cílová skupina">
            <p>{lesson.target_group}</p>
          </InfoBlock>
        )}

        {lesson.lesson_type && (
          <InfoBlock label="Typ lekce">
            <p>{lesson.lesson_type}</p>
          </InfoBlock>
        )}
      </div>

      {/* Tags */}
      {lesson.tags && lesson.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-w-[280px]">
          {lesson.tags.map((tag: { id: string; title: string }) => (
            <span
              key={tag.id}
              className="px-3 py-2 bg-grey-50 border border-black/5 text-text-subtle text-sm font-semibold rounded-full"
            >
              {tag.title}
            </span>
          ))}
        </div>
      )}

      {/* Actions (Favorite button, etc.) */}
      {children && (
        <div className="flex flex-col gap-1.5">
          {children}
        </div>
      )}
    </div>
  )
}
