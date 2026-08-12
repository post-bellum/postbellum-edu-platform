import * as React from 'react'
import { ExternalLink } from 'lucide-react'
import { LessonWitness } from '@/types/lesson.types'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { WitnessPortrait } from '@/components/lessons/WitnessPortrait'

interface WitnessDetailModalProps {
  /** The witness to show, or null when the modal is closed */
  witness: LessonWitness | null
  onClose: () => void
  /**
   * The element that opened the modal. Radix only restores focus automatically
   * when opened via DialogTrigger, and this dialog is controlled, so focus has
   * to be returned to the card's Detail button explicitly.
   */
  restoreFocusRef?: React.RefObject<HTMLElement | null>
}

/**
 * Detail modal for a single witness: portrait and Paměť národa link on the left,
 * name, birth year, full role and biography on the right.
 *
 * A single instance is rendered per row and driven by the `witness` prop, so its
 * internal state resets whenever a different card is opened.
 */
export function WitnessDetailModal({
  witness,
  onClose,
  restoreFocusRef,
}: WitnessDetailModalProps) {
  // Fall back to the short role so the line is never blank
  const role = witness?.role_full || witness?.role_short

  return (
    <Dialog open={!!witness} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[860px] w-[calc(100%-16px)] max-h-[90vh] sm:h-[600px] p-0 gap-0 flex flex-col overflow-hidden"
        onCloseAutoFocus={(event) => {
          const trigger = restoreFocusRef?.current
          if (trigger) {
            event.preventDefault()
            trigger.focus()
          }
        }}
      >
        {witness && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-6 pt-12 sm:p-10 min-h-0 overflow-y-auto md:overflow-hidden">
            {/* Portrait + Paměť národa link */}
            <div className="w-[200px] shrink-0 mx-auto md:mx-0 flex flex-col gap-5 items-center">
              <WitnessPortrait src={witness.portrait_url} name={witness.name} size={200} />

              {witness.memory_of_nations_url && (
                <a
                  href={witness.memory_of_nations_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-lg text-brand-primary hover:text-brand-primary-hover hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint rounded"
                >
                  Paměť národa
                  <ExternalLink className="w-5 h-5 shrink-0" aria-hidden />
                  <span className="sr-only">(otevře se v novém okně)</span>
                </a>
              )}
            </div>

            {/* Name, birth year, role, biography */}
            <div className="flex-1 min-w-0 md:max-w-[480px] flex flex-col gap-6 min-h-0 md:overflow-y-auto md:pr-2">
              <div className="flex flex-col gap-1">
                <DialogTitle className="font-display text-3xl font-semibold leading-display text-text-strong">
                  {witness.name}
                </DialogTitle>
                {witness.birth_year && (
                  <p className="text-md leading-body text-text-subtle">*{witness.birth_year}</p>
                )}
              </div>

              {role && (
                <p className="text-md leading-body text-text-subtle md:max-w-[280px]">{role}</p>
              )}

              {witness.bio && (
                <p className="text-md leading-body text-text-subtle whitespace-pre-line">
                  {witness.bio}
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
