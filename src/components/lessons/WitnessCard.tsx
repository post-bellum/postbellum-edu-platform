import * as React from 'react'
import { LessonWitness } from '@/types/lesson.types'
import { WitnessPortrait } from '@/components/lessons/WitnessPortrait'

interface WitnessCardProps {
  witness: LessonWitness
  /** Receives the Detail button so focus can be restored when the modal closes */
  onDetail: (trigger: HTMLButtonElement) => void
}

/**
 * Single witness card in the "Pamětníci z příběhu" row.
 * 220px wide with a circular portrait, name, short role and a Detail pill.
 */
export function WitnessCard({ witness, onDetail }: WitnessCardProps) {
  return (
    <div className="w-[220px] h-full p-5 rounded-[20px] flex flex-col gap-3 items-center hover:bg-grey-100 transition-colors">
      <WitnessPortrait src={witness.portrait_url} name={witness.name} size={100} />

      <div className="flex flex-col gap-1 items-center text-center w-full break-words">
        <p className="text-xl font-semibold leading-display text-text-strong">
          {witness.name}
        </p>
        {witness.role_short && (
          <p className="text-lg leading-headline text-text-subtle">
            {witness.role_short}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => onDetail(e.currentTarget)}
        aria-label={`Detail pamětníka ${witness.name}`}
        className="mt-auto max-w-[200px] rounded-full bg-white border-[1.25px] border-grey-300 px-4 py-1.5 text-md font-semibold text-text-strong hover:bg-grey-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
      >
        Detail
      </button>
    </div>
  )
}
