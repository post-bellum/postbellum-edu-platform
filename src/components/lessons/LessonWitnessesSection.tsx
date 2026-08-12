'use client'

import * as React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { LessonWitness } from '@/types/lesson.types'
import { WitnessCard } from '@/components/lessons/WitnessCard'
import { WitnessDetailModal } from '@/components/lessons/WitnessDetailModal'
import { cn } from '@/lib/utils'

interface LessonWitnessesSectionProps {
  witnesses: LessonWitness[]
}

const CARD_WIDTH = 220
const CARD_GAP = 8
/** Arrows advance two cards at a time */
const SCROLL_STEP = (CARD_WIDTH + CARD_GAP) * 2

/**
 * Czech pluralisation for the witness count shown next to the heading.
 */
function witnessCountLabel(count: number): string {
  if (count === 1) return '1 pamětník'
  if (count >= 2 && count <= 4) return `${count} pamětníci`
  return `${count} pamětníků`
}

/**
 * "Pamětníci z příběhu" — horizontally scrollable row of witness cards on the
 * lesson detail page. Each card opens a detail modal with the witness biography.
 *
 * Uses native horizontal scrolling rather than an index-based carousel: the design
 * deliberately shows a partially cut-off card behind a fade, the card count is
 * data-driven, and touch/trackpad swiping comes for free.
 */
export function LessonWitnessesSection({ witnesses }: LessonWitnessesSectionProps) {
  const scrollRef = React.useRef<HTMLUListElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [selected, setSelected] = React.useState<LessonWitness | null>(null)
  // Remembers the Detail button that opened the modal so focus returns to it
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    // 1px tolerance for sub-pixel scroll positions
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }, [])

  React.useEffect(() => {
    updateScrollState()

    const el = scrollRef.current
    if (!el) return

    // Recompute when the container resizes (viewport changes, sidebar reflow)
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => observer.disconnect()
  }, [updateScrollState, witnesses.length])

  const scroll = (direction: -1 | 1) => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    scrollRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  if (witnesses.length === 0) {
    return null
  }

  const isScrollable = canScrollLeft || canScrollRight

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4 pl-0 sm:pl-7">
        <h2 className="font-display text-3xl font-semibold leading-display text-grey-950">
          Pamětníci z příběhu
        </h2>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-text-subtle">{witnessCountLabel(witnesses.length)}</span>

          {isScrollable && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll(-1)}
                disabled={!canScrollLeft}
                aria-label="Předchozí pamětníci"
                className="rounded-full border-[1.25px] border-grey-200 bg-white flex items-center justify-center px-5 py-2.5 hover:bg-grey-50 transition-colors shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
              >
                <ArrowLeft className="w-5 h-5 text-grey-950" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                disabled={!canScrollRight}
                aria-label="Další pamětníci"
                className="rounded-full border-[1.25px] border-grey-200 bg-white flex items-center justify-center px-5 py-2.5 hover:bg-grey-50 transition-colors shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
              >
                <ArrowRight className="w-5 h-5 text-grey-950" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <ul
          ref={scrollRef}
          onScroll={updateScrollState}
          aria-label="Pamětníci z příběhu"
          className="flex items-stretch gap-2 pb-5 overflow-x-auto scrollbar-hide snap-x"
        >
          {witnesses.map((witness) => (
            <li key={witness.id} className="shrink-0 snap-start">
              <WitnessCard
                witness={witness}
                onDetail={(trigger) => {
                  triggerRef.current = trigger
                  setSelected(witness)
                }}
              />
            </li>
          ))}
        </ul>

        {/* Fade hinting at more cards to the right; also the primary affordance on touch */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute right-0 top-0 bottom-5 w-20 bg-linear-to-l from-white to-transparent transition-opacity',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      <WitnessDetailModal
        witness={selected}
        onClose={() => setSelected(null)}
        restoreFocusRef={triggerRef}
      />
    </div>
  )
}
