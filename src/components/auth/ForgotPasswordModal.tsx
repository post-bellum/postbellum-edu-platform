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
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold text-center mb-2 text-text">Email byl odeslán</h2>
        <p className="text-sm text-center text-text-secondary mb-8">
          Na adresu <span className="font-medium text-text">{email}</span> jsme odeslali odkaz pro obnovení hesla.
          Zkontrolujte svou e-mailovou schránku a klikněte na odkaz v emailu.
        </p>

        <Button 
          onClick={onBack}
          className="w-full h-12 bg-primary text-white hover:bg-primary-hover transition-all hover:shadow-md"
        >
          Zpět na přihlášení
        </Button>

        <p className="text-xs text-center text-text-secondary mt-4">
          Neobdrželi jste email? Zkontrolujte složku spam nebo zkuste zadat email znovu.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-3xl font-bold text-center mb-2 text-text">Zapomenuté heslo</h2>
      <p className="text-sm text-center text-text-secondary mb-8">
        Zadejte svůj email a my vám pošleme odkaz pro obnovení hesla.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vas@email.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 bg-primary text-white hover:bg-primary-hover transition-all hover:shadow-md"
          disabled={isLoading}
        >
          {isLoading ? 'Odesílání...' : 'Odeslat odkaz'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-text-secondary hover:text-text cursor-pointer transition-colors"
        >
          ← Zpět na přihlášení
        </button>
      </div>
    </div>
  )
}


