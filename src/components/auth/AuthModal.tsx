"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/Dialog"
import { LoginModal } from "./LoginModal"
import { RegisterModal } from "./RegisterModal"
import { OTPModal } from "./OTPModal"
import { CompleteRegistrationModal } from "./CompleteRegistrationModal"
import { SuccessModal } from "./SuccessModal"
import Image from "next/image"

type AuthStep = "login" | "register" | "complete" | "otp" | "success"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStep?: AuthStep
}

export function AuthModal({ open, onOpenChange, defaultStep = "login" }: AuthModalProps) {
  const [step, setStep] = React.useState<AuthStep>(defaultStep)
  const [email, setEmail] = React.useState("")

  // Reset to default step when modal opens
  React.useEffect(() => {
    if (open) {
      setStep(defaultStep)
    }
  }, [open, defaultStep])

  const handleLoginSuccess = () => {
    onOpenChange(false)
    // TODO: Redirect or update app state
  }

  const handleRegisterSuccess = () => {
    // After registration, go to complete registration
    setStep("complete")
  }

  const handleCompleteRegistrationSuccess = () => {
    // After completing registration, go to OTP verification
    setStep("otp")
  }

  const handleOTPSuccess = () => {
    // After OTP verification, show success checkmark
    setStep("success")
  }

  const handleSuccessComplete = () => {
    // Close modal after viewing success message
    onOpenChange(false)
    // TODO: Redirect to dashboard or update app state
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
        {step === "login" && (
          <LoginModal
            onSwitchToRegister={() => setStep("register")}
            onSuccess={handleLoginSuccess}
          />
        )}

        {step === "register" && (
          <RegisterModal
            onSwitchToLogin={() => setStep("login")}
            onSuccess={handleRegisterSuccess}
          />
        )}

        {step === "complete" && (
          <CompleteRegistrationModal
            onSuccess={handleCompleteRegistrationSuccess}
          />
        )}

        {step === "otp" && (
          <OTPModal
            email={email}
            onSuccess={handleOTPSuccess}
            onBack={() => setStep("complete")}
          />
        )}

        {step === "success" && (
          <SuccessModal onSuccess={handleSuccessComplete} />
        )}
      </DialogContent>
    </Dialog>
  )
}


