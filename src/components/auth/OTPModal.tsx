'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { InputOTP } from '@/components/ui/InputOTP'
import { verifyOTP, resendOTP, getErrorMessage } from '@/lib/supabase/email-auth'
import { logger } from '@/lib/logger'

interface OTPModalProps {
  email: string
  password?: string // For QA bypass
  onSuccess: () => void
  onBack: () => void
}

export function OTPModal({ email, password, onSuccess, onBack }: OTPModalProps) {
  const router = useRouter()
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
      const result = await verifyOTP(email, otp, password || '')
      
      if (result.error) {
        setError(getErrorMessage(result.error))
        return
      }

      // For QA bypass, refresh the page to pick up new session cookies
      if (result.isQABypass) {
        logger.info('QA verification successful, refreshing page')
        onSuccess()
        // Use router.refresh() to refresh server components and pick up new cookies
        router.refresh()
        // Also reload to ensure client state is updated
        window.location.reload()
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
    <div className="flex flex-col gap-7">
      {/* Title & Description */}
      <div className="text-center">
        <h2 className="font-display text-[32px] sm:text-[32px] font-semibold leading-display text-grey-950 mb-2.5">
          Ověřte svůj email
        </h2>
        <p className="text-base leading-[1.5] text-text-subtle">
          Poslali jsme 6místný ověřovací kód na adresu{' '}
          <span className="font-medium text-grey-950">{email}</span>
        </p>
      </div>

      {/* Content Stack */}
      <div className="flex flex-col gap-5">
        <form onSubmit={handleVerify} className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-4">
            <InputOTP length={6} onChange={setOtp} data-testid="otp-input" />
            
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {resendSuccess && (
              <p className="text-sm text-green-600">Nový kód byl odeslán na váš email</p>
            )}
          </div>

          <Button 
            type="submit" 
            size="large"
            className="w-full"
            disabled={isLoading || otp.length !== 6}
            data-testid="otp-verify-button"
          >
            {isLoading ? 'Ověřování...' : 'Ověřit'}
          </Button>
        </form>
      </div>

      {/* Footer Links */}
      <div className="text-center space-y-2">
        <p className="text-sm leading-[1.5] text-grey-600">
          Nedostali jste kód?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="text-brand-primary underline decoration-dotted decoration-[1.7px] hover:text-brand-primary-hover cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="otp-resend-button"
            >
              Odeslat znovu
            </button>
          ) : (
            <span className="text-grey-600">
              Odeslat znovu za {countdown}s
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-grey-600 hover:text-grey-950 cursor-pointer transition-colors"
          data-testid="otp-back-button"
        >
          ← Zpět na registraci
        </button>
      </div>
    </div>
  )
}

