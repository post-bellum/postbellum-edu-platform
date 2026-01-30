'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function NewsletterSignup() {
  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    const trimmedEmail = email.trim()
    
    if (!trimmedEmail) {
      setError('Zadejte prosím e-mailovou adresu')
      return
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Zadejte prosím platnou e-mailovou adresu')
      return
    }

    setIsLoading(true)

    try {
      const result = await subscribeToNewsletter(trimmedEmail)

      if (result.success) {
        setEmail('')
        setShowSuccessModal(true)
      } else {
        setError(result.error || 'Něco se pokazilo')
      }
    } catch {
      setError('Nepodařilo se přihlásit k odběru. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex-1 flex flex-col gap-5 items-start max-w-full md:max-w-[500px] w-full">
        <div className="flex flex-col gap-3 items-start px-3 w-full">
          <h3 className="font-display text-2xl font-semibold leading-none text-text-strong w-full">
            Nechte mě vědět o novinkách
          </h3>
          <p className="font-body text-sm leading-[1.4] text-text-subtle w-full">
            Buďte první, kdo se dozví o nové lekci inspirované životními příběhy.
          </p>
        </div>

        {/* Email input with button */}
        <form onSubmit={handleSubscribe} className="relative w-full">
          <div className="relative w-full h-12">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              placeholder="hello@postbellum.cz"
              disabled={isLoading}
              aria-label="E-mailová adresa pro odběr novinek"
              className={`w-full h-12 bg-white border rounded-full px-5 py-3 font-body text-lg text-grey-600 placeholder:text-grey-600 focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                error ? 'border-red-500' : 'border-grey-300'
              }`}
            />
            <Button
              type="submit"
              variant="ultra"
              size="small"
              disabled={isLoading}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-24"
            >
              {isLoading ? '...' : 'Odběr'}
            </Button>
          </div>
          {error && (
            <p className="mt-2 px-3 text-sm text-red-600">{error}</p>
          )}
        </form>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Děkujeme za přihlášení!
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Budeme vás informovat o nových lekcích a zajímavostech ze světa
              vzdělávání prostřednictvím příběhů pamětníků.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              variant="mint"
              className="w-full"
            >
              Rozumím
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
