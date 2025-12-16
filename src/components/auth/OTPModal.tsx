'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { InputOTP } from '@/components/ui/InputOTP'
import { verifyOTP, resendOTP, getErrorMessage } from '@/lib/supabase/email-auth'
import { logger } from '@/lib/logger'

interface OTPModalProps {
  email: string
  onSuccess: () => void
  onBack: () => void
}

export function OTPModal({ email, onSuccess, onBack }: OTPModalProps) {
  const [otp, setOtp] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [resendSuccess, setResendSuccess] = React.useState(false)
  const [countdown, setCountdown] = React.useState(60) // Start countdown immediately
  const [canResend, setCanResend] = React.useState(false) // Disable resend initially

  // Countdown timer for resend (only when countdown > 0)
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      setError('Zadejte prosím celý 6místný kód')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const { error: verifyError } = await verifyOTP(email, otp)
      
      if (verifyError) {
        setError(getErrorMessage(verifyError))
        return
      }

      // After successful verification:
      onSuccess()
    } catch (error) {
      logger.error('OTP verification error', error)
      setError('Neplatný kód. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    
    setIsLoading(true)
    setError('')
    setResendSuccess(false)
    
    try {
      const { error: resendError } = await resendOTP(email)
      
      if (resendError) {
        setError(getErrorMessage(resendError))
        return
      }

      setResendSuccess(true)
      setCountdown(60) // Reset countdown
      setCanResend(false)
      setTimeout(() => setResendSuccess(false), 3000) // Hide message after 3s
    } catch (error) {
      logger.error('Resend OTP error', error)
      setError('Nepodařilo se odeslat nový kód. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-3xl font-bold text-center mb-2 text-text">Ověřte svůj email</h2>
      <p className="text-sm text-center text-text-secondary mb-8">
        Poslali jsme 6místný ověřovací kód na adresu{' '}
        <span className="font-medium text-text">{email}</span>
      </p>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <InputOTP length={6} onChange={setOtp} />
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {resendSuccess && (
            <p className="text-sm text-green-600">Nový kód byl odeslán na váš email</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-primary text-white hover:bg-primary-hover transition-all hover:shadow-md"
          disabled={isLoading || otp.length !== 6}
          data-testid="otp-verify-button"
        >
          {isLoading ? 'Ověřování...' : 'Ověřit'}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-text-secondary">
          Nedostali jste kód?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="otp-resend-button"
            >
              Odeslat znovu
            </button>
          ) : (
            <span className="text-text-secondary">
              Odeslat znovu za {countdown}s
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-text-secondary hover:text-text cursor-pointer transition-colors"
          data-testid="otp-back-button"
        >
          ← Zpět na registraci
        </button>
      </div>
    </div>
  )
}

