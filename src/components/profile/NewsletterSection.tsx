import * as React from 'react'
import { Check } from 'lucide-react'
import { Switch } from '@/components/ui/Switch'
import { Label } from '@/components/ui/Label'

interface NewsletterSectionProps {
  /** Whether the user is currently subscribed to the newsletter */
  isSubscribed: boolean
  /** Callback when the toggle changes; receives the requested new value */
  onToggle: (next: boolean) => void
  /** Whether the subscription change is currently being saved */
  isSaving: boolean
}

export function NewsletterSection({
  isSubscribed,
  onToggle,
  isSaving,
}: NewsletterSectionProps) {
  return (
    <div
      className="bg-white border-[1.25px] border-grey-200 rounded-[28px] shadow-sm overflow-hidden w-full"
      data-testid="newsletter-section"
    >
      <div className="flex flex-col gap-7 px-5 py-7">
        <div className="flex flex-col gap-1.5 px-3">
          <h2 className="text-lg font-semibold text-black leading-display">Odběr novinek</h2>
          <p className="max-w-[560px] text-base text-text-subtle leading-[1.5]">
            Rozhodněte, jestli vám chceme posílat e-maily. Odběr můžete kdykoli zapnout
            nebo zrušit.
          </p>
        </div>
        <div className="flex items-start gap-4 rounded-2xl bg-grey-50 px-6 py-5">
          <div className="flex flex-1 min-w-0 flex-col gap-1">
            <Label
              htmlFor="newsletter-toggle"
              className="text-base font-semibold text-black leading-[1.4] cursor-pointer"
            >
              Odebírat e-maily od StoryOn
            </Label>
            {isSubscribed ? (
              <span className="flex items-center gap-1 text-sm text-brand-primary leading-[1.4]">
                <Check className="size-4 shrink-0" aria-hidden="true" />
                Jste přihlášený k odběru
              </span>
            ) : (
              <span className="text-sm text-text-subtle leading-[1.4]">
                Nejste přihlášený k odběru
              </span>
            )}
          </div>
          <Switch
            id="newsletter-toggle"
            checked={isSubscribed}
            onCheckedChange={onToggle}
            disabled={isSaving}
            aria-label="Odběr newsletteru"
            data-testid="newsletter-toggle"
          />
        </div>
      </div>
    </div>
  )
}
