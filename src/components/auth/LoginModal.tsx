"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Checkbox } from "@/components/ui/Checkbox"
import { OAuthButtons } from "./OAuthButtons"
import { signInWithEmail, getErrorMessage } from "@/lib/supabase/email-auth"

interface LoginModalProps {
  onSwitchToRegister: () => void
  onSuccess?: () => void
  onForgotPassword?: () => void
}

export function LoginModal({ onSwitchToRegister, onSuccess, onForgotPassword }: LoginModalProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      const { data, error: signInError } = await signInWithEmail(email, password)
      
      if (signInError) {
        setError(getErrorMessage(signInError))
        return
      }

      if (!data || !data.user) {
        setError("Přihlášení se nezdařilo")
        return
      }

      // After successful login
      onSuccess?.()
    } catch (error) {
      console.error("Login error:", error)
      setError("Při přihlášení došlo k chybě. Zkuste to prosím znovu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-3xl font-bold text-center mb-6 text-text">Přihlásit</h2>

      <OAuthButtons />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-text-secondary">NEBO</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Heslo</Label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-primary hover:text-primary-hover hover:underline cursor-pointer"
              >
                Zapomenuté heslo?
              </button>
            )}
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
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
          {isLoading ? "Přihlašování..." : "Přihlásit"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary">
          Jeste nemáte účet?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer transition-colors"
          >
            Zaregistrovat se
          </button>
        </p>
      </div>
    </div>
  )
}

