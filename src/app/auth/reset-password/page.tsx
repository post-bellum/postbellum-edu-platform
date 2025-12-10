'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { updatePassword, getErrorMessage } from '@/lib/supabase/email-auth'
import { validatePassword, passwordsMatch } from '@/lib/validation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
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
        setPasswordErrors(validation.errors)
        setError(validation.errors[0])
        return
      }

      // Check passwords match
      if (!passwordsMatch(password, confirmPassword)) {
        setError('Hesla se neshodují')
        return
      }

      // Update password
      const { error: updateError } = await updatePassword(password)
      
      if (updateError) {
        setError(getErrorMessage(updateError))
        return
      }

      setSuccess(true)
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch {
      // Error already logged by updatePassword function
      setError('Při změně hesla došlo k chybě. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.svg"
              alt="Post Bellum logo"
              width={200}
              height={100}
              priority
            />
          </div>
          
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Heslo bylo změněno</h2>
            <p className="text-sm text-text-secondary">
              Vaše heslo bylo úspěšně změněno. Za chvíli budete přesměrováni na přihlášení.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.svg"
            alt="Post Bellum logo"
            width={200}
            height={100}
            priority
          />
        </div>

        <h2 className="text-3xl font-bold text-center mb-2 text-text">Nové heslo</h2>
        <p className="text-sm text-center text-text-secondary mb-8">
          Zadejte své nové heslo
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nové heslo</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nové heslo"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={handlePasswordBlur}
              required
              disabled={isLoading}
            />
            {passwordTouched && passwordErrors.length > 0 && (
              <ul className="text-xs text-red-600 space-y-1">
                {passwordErrors.map((err, index) => (
                  <li key={index}>• {err}</li>
                ))}
              </ul>
            )}
            {!passwordTouched && (
              <p className="text-xs text-text-secondary">
                Minimálně 8 znaků, velké a malé písmeno, číslo
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Zopakujte heslo</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Zopakujte heslo"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmPasswordTouched(true)}
              required
              disabled={isLoading}
            />
            {confirmPasswordTouched && confirmPassword && !passwordsMatch(password, confirmPassword) && (
              <p className="text-xs text-red-600">Hesla se neshodují</p>
            )}
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
            {isLoading ? 'Ukládání...' : 'Změnit heslo'}
          </Button>
        </form>
      </div>
    </main>
  )
}


