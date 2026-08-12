'use client'

import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { FormField } from './FormField'
import { HOMEPAGE_LESSONS_COUNT } from '@/lib/constants'
import type { Lesson } from '@/types/lesson.types'

/** Sentinel for "no lesson in this slot" — Radix Select forbids an empty value */
const EMPTY_VALUE = '__none__'

interface FeaturedLessonsPickerProps {
  /** Selected lesson IDs in display order (compact — no gaps) */
  value: string[]
  onChange: (value: string[]) => void
  /** Published lessons available for selection */
  lessons: Lesson[]
  loading?: boolean
}

export function FeaturedLessonsPicker({
  value,
  onChange,
  lessons,
  loading = false,
}: FeaturedLessonsPickerProps) {
  // Fixed number of slots so the admin sees positions 1–4 even when unfilled
  const slots = Array.from(
    { length: HOMEPAGE_LESSONS_COUNT },
    (_, index) => value[index] ?? ''
  )

  const handleSlotChange = (slotIndex: number, lessonId: string) => {
    const next = slots.map((id, index) => {
      if (index === slotIndex) return lessonId
      // A lesson can only occupy one slot — clear it wherever it was before
      return id === lessonId ? '' : id
    })
    onChange(next.filter((id) => id !== ''))
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-grey-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Načítám lekce…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-grey-500">
        Vyberte lekce a jejich pořadí na domovské stránce. Nabízí se pouze publikované
        lekce. Pokud nevyberete žádnou, zobrazí se automaticky nejnovější lekce.
      </p>

      {lessons.length === 0 ? (
        <p className="text-sm text-grey-500">Nejsou k dispozici žádné publikované lekce.</p>
      ) : (
        slots.map((selectedId, index) => (
          <FormField key={index} label={`${index + 1}. lekce`}>
            <Select
              value={selectedId || EMPTY_VALUE}
              onValueChange={(next) =>
                handleSlotChange(index, next === EMPTY_VALUE ? '' : next)
              }
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Nevybráno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY_VALUE}>Nevybráno</SelectItem>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        ))
      )}
    </div>
  )
}
