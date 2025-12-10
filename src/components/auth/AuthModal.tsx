'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/Dialog'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'
import { OTPModal } from './OTPModal'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import Image from 'next/image'

type AuthStep = 'login' | 'register' | 'otp' | 'forgot-password'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStep?: AuthStep
  returnTo?: string
}

export function AuthModal({ open, onOpenChange, defaultStep = 'login', returnTo }: AuthModalProps) {
  const [step, setStep] = React.useState<AuthStep>(defaultStep)
  const [email, setEmail] = React.useState('')

  // Reset to default step when modal opens
  React.useEffect(() => {
    if (open) {
      setStep(defaultStep)
    }
  }, [open, defaultStep])

  const handleLoginSuccess = () => {
    onOpenChange(false)
  }

  const handleRegisterSuccess = (registrationEmail: string) => {
    // After registration, go to OTP verification
    setEmail(registrationEmail)
    setStep('otp')
  }

  const handleOTPSuccess = () => {
    // After OTP verification, close modal and let home page handle registration completion
    // This keeps the flow consistent with OAuth users
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
      <div className="flex justify-center mb-6">
        <Image
            src="/logo.svg"
            alt="Post Bellum logo"
            width={200}
            height={100}
            priority
          />
      </div>
        {step === 'login' && (
          <LoginModal
            onSwitchToRegister={() => setStep('register')}
            onSuccess={handleLoginSuccess}
            onForgotPassword={() => setStep('forgot-password')}
            returnTo={returnTo}
          />
        )}

        {step === 'register' && (
          <RegisterModal
            onSwitchToLogin={() => setStep('login')}
            onSuccess={handleRegisterSuccess}
            returnTo={returnTo}
          />
        )}

        {step === 'otp' && (
          <OTPModal
            email={email}
            onSuccess={handleOTPSuccess}
            onBack={() => setStep('register')}
          />
        )}

        {step === 'forgot-password' && (
          <ForgotPasswordModal
            onBack={() => setStep('login')}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}


