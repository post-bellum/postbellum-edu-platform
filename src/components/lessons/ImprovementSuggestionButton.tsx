'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Lightbulb } from 'lucide-react'
import { submitImprovementSuggestionAction } from '@/app/actions/improvement-suggestions'
import { IMPROVEMENT_SUGGESTION_CONSTANTS } from '@/lib/constants'
import { AuthModal } from '@/components/auth'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { FeedbackModal } from '@/components/ui/FeedbackModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

const { MESSAGE_MIN_LENGTH, MESSAGE_MAX_LENGTH } = IMPROVEMENT_SUGGESTION_CONSTANTS

interface ImprovementSuggestionButtonProps {
  lessonId: string
  isLoggedIn: boolean
}

/**
 * Lesson detail sidebar action. Used to be a `mailto:` link, which fails on
 * machines with no mail client configured; the suggestion is now written in a
 * dialog and delivered by the server to the admin inbox.
 *
 * Sending requires an account - a signed-out user gets the auth modal instead.
 */
export function ImprovementSuggestionButton({
  lessonId,
  isLoggedIn,
}: ImprovementSuggestionButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const [state, formAction, isPending] = useActionState(
    async (_prevState: unknown, formData: FormData) =>
      submitImprovementSuggestionAction(formData),
    null
  )

  // Each action result must be handled only once, otherwise the effect replays
  // a stale success when the dialog is reopened.
  const handledStateRef = React.useRef<unknown>(null)

  React.useEffect(() => {
    if (state?.success && handledStateRef.current !== state) {
      handledStateRef.current = state
      setIsDialogOpen(false)
      setMessage('')
      setIsSuccessOpen(true)
    }
  }, [state])

  const handleAuthModalChange = (open: boolean) => {
    setIsAuthModalOpen(open)
    // Refresh once the modal closes so the button picks up a new session
    if (!open) {
      router.refresh()
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (open) {
      setMessage('')
    }
  }

  const handleClick = () => {
    if (isLoggedIn) {
      handleDialogOpenChange(true)
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData()
    formData.set('message', message)
    formData.set('lesson_id', lessonId)
    React.startTransition(() => {
      formAction(formData)
    })
  }

  const canSubmit = message.trim().length >= MESSAGE_MIN_LENGTH && !isPending

  return (
    <>
      <Button
        variant="secondary"
        size="medium"
        className="w-full justify-center"
        onClick={handleClick}
        data-testid="improvement-suggestion-button"
      >
        <Lightbulb className="w-5 h-5" />
        Poslat návrh na zlepšení
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="max-w-[560px]"
          data-testid="improvement-suggestion-dialog"
        >
          <DialogHeader>
            <DialogTitle>Poslat návrh na zlepšení</DialogTitle>
            <DialogDescription>
              Napište nám, co bychom mohli u této lekce nebo na platformě vylepšit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Textarea
                id="improvement-suggestion-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                maxLength={MESSAGE_MAX_LENGTH}
                disabled={isPending}
                placeholder="Např. u třetí aktivity by pomohl konkrétnější zadání pro žáky…"
                aria-label="Text návrhu"
                data-testid="improvement-suggestion-textarea"
              />
              <p className="text-xs text-text-subtle">
                {message.length} / {MESSAGE_MAX_LENGTH} znaků
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={isPending}
              >
                Zrušit
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                data-testid="improvement-suggestion-submit"
              >
                {isPending ? 'Odesílám…' : 'Odeslat'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <FeedbackModal
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        type="success"
        title="Děkujeme za návrh"
        message="Váš návrh jsme předali našemu týmu."
      />

      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={handleAuthModalChange}
        defaultStep="login"
        returnTo={pathname}
      />
    </>
  )
}
