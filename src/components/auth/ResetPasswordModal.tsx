'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Label } from '@/components/ui/Label'
import { updatePassword, getErrorMessage } from '@/lib/supabase/email-auth'
import { validatePassword, passwordsMatch } from '@/lib/validation'

interface ResetPasswordModalProps {
  onSuccess: () => void
}

export function ResetPasswordModal({ onSuccess }: ResetPasswordModalProps) {
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = React.useState<string[]>([])
  const [passwordTouched, setPasswordTouched] = React.useState(false)
  const [confirmPasswordTouched, setConfirmPasswordTouched] = React.useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate password
      const validation = validatePassword(password)
      if (!validation.isValid) {
        setPasswordTouched(true)
        setPasswordErrors(validation.errors)
        setError(validation.errors[0])
        return
      }

      // Check passwords match
      if (!passwordsMatch(password, confirmPassword)) {
        setConfirmPasswordTouched(true)
        return
      }

      // Update password
      const { error: updateError } = await updatePassword(password)

      if (updateError) {
        setError(getErrorMessage(updateError))
        return
      }

      onSuccess()
    } catch {
      // Error already logged by updatePassword function
      setError('Při změně hesla došlo k chybě. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Title & Description */}
      <div className="text-center">
        <h2 className="font-display text-[32px] font-semibold leading-display text-grey-950 mb-2.5">
          Nové heslo
        </h2>
        <p className="text-base leading-[1.5] text-text-subtle">
          Zadejte své nové heslo
        </p>
      </div>

      {/* Content Stack */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[15px]">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col">
            <Label htmlFor="password" className="px-2.5 py-1 text-sm leading-[1.4] text-text-subtle">
              Nové heslo
            </Label>
            <PasswordInput
              id="password"
              placeholder="Nové heslo"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={handlePasswordBlur}
              required
              disabled={isLoading}
              data-testid="reset-password-new-password-input"
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
            <PasswordInput
              id="confirmPassword"
              placeholder="Zopakujte heslo"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmPasswordTouched(true)}
              required
              disabled={isLoading}
              data-testid="reset-password-confirm-password-input"
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

        <Button
          type="submit"
          size="large"
          className="w-full"
          disabled={isLoading}
          data-testid="reset-password-submit-button"
        >
          {isLoading ? 'Ukládání...' : 'Změnit heslo'}
        </Button>
      </form>
    </div>
  )
}
