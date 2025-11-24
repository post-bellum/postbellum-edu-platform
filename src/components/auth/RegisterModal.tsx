"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Checkbox } from "@/components/ui/Checkbox"
import { OAuthButtons } from "./OAuthButtons"
import { signUpWithEmail, getErrorMessage } from "@/lib/supabase/email-auth"
import { validatePassword, passwordsMatch } from "@/lib/validation"

interface RegisterModalProps {
  onSwitchToLogin: () => void
  onSuccess: (email: string) => void
}

export function RegisterModal({ onSwitchToLogin, onSuccess }: RegisterModalProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [termsAccepted, setTermsAccepted] = React.useState(false)
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

  const handleRegister = async (e: React.FormEvent) => {
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
        setError("Hesla se neshodují")
        return
      }

      // Register with Supabase
      const { error: signUpError } = await signUpWithEmail(email, password)
      
      if (signUpError) {
        setError(getErrorMessage(signUpError))
        return
      }

      // After successful registration, move to OTP verification
      onSuccess(email)
    } catch (error) {
      console.error("Registration error:", error)
      setError("Při registraci došlo k chybě. Zkuste to prosím znovu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-3xl font-bold text-center mb-2 text-text">Vytvořte si účet</h2>
      <p className="text-sm text-center text-text-secondary mb-6">
        Začněte tím, že vyplníte své údaje. Váš účet vám umožní upravovat materiály, ukládat vlastní lekce a hodnotit obsah.
      </p>

      <OAuthButtons />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-text-secondary">NEBO</span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Heslo</Label>
          <Input
            id="password"
            type="password"
            placeholder="Heslo"
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            disabled={isLoading}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none cursor-pointer select-none hover:text-text transition-colors peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Souhlasím s podmínkami používání
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-primary text-white hover:bg-primary-hover transition-all hover:shadow-md"
          disabled={isLoading || !termsAccepted}
        >
          {isLoading ? "Registrace..." : "Zaregistrovat se"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary">
          Už máte účet?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer transition-colors"
          >
            Přihlaste se
          </button>
        </p>
      </div>
    </div>
  )
}

