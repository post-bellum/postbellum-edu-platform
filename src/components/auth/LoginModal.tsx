'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { OAuthButtons } from './OAuthButtons'
import { signInWithEmail, getErrorMessage } from '@/lib/supabase/email-auth'
import { validateEmail } from '@/lib/validation'
import { logger } from '@/lib/logger'

interface LoginModalProps {
  onSwitchToRegister: () => void
  onSuccess?: () => void
  onForgotPassword?: () => void
  returnTo?: string
}

export function LoginModal({ onSwitchToRegister, onSuccess, onForgotPassword, returnTo }: LoginModalProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [emailTouched, setEmailTouched] = React.useState(false)
  const [emailError, setEmailError] = React.useState<string | null>(null)

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (emailTouched) {
      setEmailError(value && !validateEmail(value) ? 'Neplatný formát emailu' : null)
    }
  }

  const handleEmailBlur = () => {
    setEmailTouched(true)
    setEmailError(email && !validateEmail(email) ? 'Neplatný formát emailu' : null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      // Validate email
      if (!validateEmail(email)) {
        setEmailTouched(true)
        setEmailError('Neplatný formát emailu')
        setError('Neplatný formát emailu')
        return
      }

      const { data, error: signInError } = await signInWithEmail(email, password)
      
      if (signInError) {
        setError(getErrorMessage(signInError))
        return
      }

      if (!data || !data.user) {
        setError('Přihlášení se nezdařilo')
        return
      }

      // After successful login
      onSuccess?.()
    } catch (error) {
      logger.error('Login error', error)
      setError('Při přihlášení došlo k chybě. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Title */}
      <h2 className="font-display text-[32px] sm:text-[32px] font-semibold leading-[1.2] text-center text-grey-950">
        Přihlásit
      </h2>

      {/* Content Stack */}
      <div className="flex flex-col gap-[15px]">
        {/* OAuth Buttons */}
        <OAuthButtons returnTo={returnTo} />

        {/* Divider */}
        <div className="flex items-center gap-5 px-5">
          <div className="flex-1 h-[0.5px] bg-grey-300" />
          <span className="text-xs leading-[1.5] text-text-subtle uppercase">NEBO</span>
          <div className="flex-1 h-[0.5px] bg-grey-300" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} noValidate className="flex flex-col gap-[15px]">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col">
              <Label htmlFor="email" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                required
                disabled={isLoading}
                data-testid="login-email-input"
              />
              {emailTouched && emailError && (
                <p className="text-xs text-red-600 px-2.5 py-1.5">{emailError}</p>
              )}
            </div>

            <div className="flex flex-col">
              <Label htmlFor="password" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
                Heslo
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                data-testid="login-password-input"
              />
            </div>

            {onForgotPassword && (
              <div className="flex justify-end px-2.5">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-brand-primary hover:text-brand-primary-hover hover:underline cursor-pointer"
                  data-testid="forgot-password-link"
                >
                  Zapomenuté heslo?
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="large"
            className="w-full"
            disabled={isLoading}
            data-testid="login-submit-button"
          >
            {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
          </Button>
        </form>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-center gap-2 text-sm leading-[1.5]">
        <span className="text-grey-600">Ještě nemáte účet?</span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-brand-primary underline decoration-dotted decoration-[1.7px] hover:text-brand-primary-hover cursor-pointer transition-colors"
          data-testid="switch-to-register-button"
        >
          Zaregistrovat se
        </button>
      </div>
    </div>
  )
}

