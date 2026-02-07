'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { sendPasswordResetEmail, getErrorMessage } from '@/lib/supabase/email-auth'
import { logger } from '@/lib/logger'

interface ForgotPasswordModalProps {
  onBack: () => void
}

export function ForgotPasswordModal({ onBack }: ForgotPasswordModalProps) {
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      const { error: resetError } = await sendPasswordResetEmail(email)
      
      if (resetError) {
        setError(getErrorMessage(resetError))
        return
      }

      setSuccess(true)
    } catch (error) {
      logger.error('Password reset error', error)
      setError('Při odesílání emailu došlo k chybě. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-7">
        {/* Title & Description */}
        <div className="text-center">
          <h2 className="font-display text-[32px] sm:text-[32px] font-semibold leading-display text-grey-950 mb-2.5">
            Email byl odeslán
          </h2>
          <p className="text-base leading-[1.5] text-text-subtle">
            Na adresu <span className="font-medium text-grey-950">{email}</span> jsme odeslali odkaz pro obnovení hesla.
            Zkontrolujte svou e-mailovou schránku a klikněte na odkaz v emailu.
          </p>
        </div>

        {/* Content Stack */}
        <div className="flex flex-col gap-4">
          <Button 
            onClick={onBack}
            size="large"
            className="w-full"
            data-testid="forgot-password-success-back-button"
          >
            Zpět na přihlášení
          </Button>

          <p className="text-xs text-center text-text-subtle">
            Neobdrželi jste email? Zkontrolujte složku spam nebo zkuste zadat email znovu.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Title & Description */}
      <div className="text-center">
        <h2 className="font-display text-[32px] sm:text-[32px] font-semibold leading-display text-grey-950 mb-2.5">
          Zapomenuté heslo
        </h2>
        <p className="text-base leading-[1.5] text-text-subtle">
          Zadejte svůj email a my vám pošleme odkaz pro obnovení hesla.
        </p>
      </div>

      {/* Content Stack */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[15px]">
        <div className="flex flex-col">
          <Label htmlFor="email" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="vas@email.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            data-testid="forgot-password-email-input"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          size="large"
          className="w-full"
          disabled={isLoading}
          data-testid="forgot-password-submit-button"
        >
          {isLoading ? 'Odesílání...' : 'Odeslat odkaz'}
        </Button>
      </form>

      {/* Footer Link */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-grey-600 hover:text-grey-950 cursor-pointer transition-colors"
          data-testid="forgot-password-back-button"
        >
          ← Zpět na přihlášení
        </button>
      </div>
    </div>
  )
}


