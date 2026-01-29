'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { OAuthButtons } from './OAuthButtons'
import { signUpWithEmail, getErrorMessage } from '@/lib/supabase/email-auth'
import { validatePassword, passwordsMatch, validateEmail } from '@/lib/validation'
import { logger } from '@/lib/logger'

interface RegisterModalProps {
  onSwitchToLogin: () => void
  onSuccess: (email: string, password: string) => void
  returnTo?: string
}

export function RegisterModal({ onSwitchToLogin, onSuccess, returnTo }: RegisterModalProps) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [emailTouched, setEmailTouched] = React.useState(false)
  const [emailError, setEmailError] = React.useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = React.useState<string[]>([])
  const [passwordTouched, setPasswordTouched] = React.useState(false)
  const [confirmPasswordTouched, setConfirmPasswordTouched] = React.useState(false)

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

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (passwordTouched) {
      const validation = validatePassword(value)
      setPasswordErrors(validation.errors)
    }
  }

  const handlePasswordBlur = () => {
    setPasswordTouched(true)
    const validation = validatePassword(password)
    setPasswordErrors(validation.errors)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      // Validate email
      if (!validateEmail(email)) {
        setEmailTouched(true)
        setEmailError('Neplatný formát emailu')
        return
      }

      // Validate password
      const validation = validatePassword(password)
      if (!validation.isValid) {
        setPasswordTouched(true)
        setPasswordErrors(validation.errors)
        return
      }

      // Check passwords match
      if (!passwordsMatch(password, confirmPassword)) {
        setConfirmPasswordTouched(true)
        return
      }

      // Register with Supabase
      const { error: signUpError } = await signUpWithEmail(email, password)
      
      if (signUpError) {
        setError(getErrorMessage(signUpError))
        return
      }

      // After successful registration, move to OTP verification
      onSuccess(email, password)
    } catch (error) {
      logger.error('Registration error', error)
      setError('Při registraci došlo k chybě. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Title & Description */}
      <div className="text-center">
        <h2 className="font-display text-[32px] sm:text-[32px] font-semibold leading-[1.2] text-grey-950 mb-2.5">
          Vytvořte si účet
        </h2>
        <p className="text-base leading-[1.5] text-text-subtle">
          Začněte tím, že vyplníte své údaje. Váš účet vám umožní upravovat materiály, ukládat vlastní lekce a hodnotit obsah.
        </p>
      </div>

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

        {/* Registration Form */}
        <form onSubmit={handleRegister} noValidate className="flex flex-col gap-[15px]">
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
                data-testid="register-email-input"
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
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                required
                disabled={isLoading}
                data-testid="register-password-input"
              />
              {passwordTouched && passwordErrors.length > 0 ? (
                <ul className="text-xs text-red-600 space-y-1 px-2.5 py-1.5">
                  {passwordErrors.map((err, index) => (
                    <li key={index}>• {err}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text-subtle px-2.5 py-1.5">
                  Minimálně 8 znaků, velké a malé písmeno, číslo
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <Label htmlFor="confirmPassword" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
                Zopakujte heslo
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Zopakujte heslo"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setConfirmPasswordTouched(true)}
                required
                disabled={isLoading}
                data-testid="register-confirm-password-input"
              />
              {confirmPasswordTouched && confirmPassword && !passwordsMatch(password, confirmPassword) && (
                <p className="text-xs text-red-600 px-2.5 py-1.5">Hesla se neshodují</p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="large"
            className="w-full"
            disabled={isLoading}
            data-testid="register-submit-button"
          >
            {isLoading ? 'Registrace...' : 'Zaregistrovat se'}
          </Button>
        </form>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-center gap-2 text-sm leading-[1.5]">
        <span className="text-grey-600">Už máte účet?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-brand-primary underline decoration-dotted decoration-[1.7px] hover:text-brand-primary-hover cursor-pointer transition-colors"
          data-testid="switch-to-login-button"
        >
          Přihlásit se
        </button>
      </div>
    </div>
  )
}

