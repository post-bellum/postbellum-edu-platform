"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { InputOTP } from "@/components/ui/InputOTP"

interface OTPModalProps {
  email: string
  onSuccess: () => void
  onBack: () => void
}

export function OTPModal({ email, onSuccess, onBack }: OTPModalProps) {
  const [otp, setOtp] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      setError("Zadejte prosím celý 6místný kód")
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      // TODO: Implement OTP verification logic
      console.log("Verify OTP:", { email, otp })
      // After successful verification:
      onSuccess()
    } catch (error) {
      console.error("OTP verification error:", error)
      setError("Neplatný kód. Zkuste to prosím znovu.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      // TODO: Implement resend OTP logic
      console.log("Resend OTP to:", email)
    } catch (error) {
      console.error("Resend OTP error:", error)
      setError("Nepodařilo se odeslat nový kód. Zkuste to prosím znovu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-3xl font-bold text-center mb-2 text-text">Ověřte svůj email</h2>
      <p className="text-sm text-center text-text-secondary mb-8">
        Poslali jsme 6místný ověřovací kód na adresu{" "}
        <span className="font-medium text-text">{email}</span>
      </p>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <InputOTP length={6} onChange={setOtp} />
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-primary text-white hover:bg-primary-hover transition-all hover:shadow-md"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? "Ověřování..." : "Ověřit"}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-text-secondary">
          Nedostali jste kód?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Odeslat znovu
          </button>
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-text-secondary hover:text-text cursor-pointer transition-colors"
        >
          ← Zpět na registraci
        </button>
      </div>
    </div>
  )
}

