'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { ResetPasswordModal } from './ResetPasswordModal'

/**
 * Hosts the "set a new password" step in a modal over the page behind it,
 * consistent with the login / registration flow (see AuthModal).
 *
 * Opened by the recovery link from the password reset email.
 */
export function ResetPasswordDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(true)
  const [success, setSuccess] = React.useState(false)

  const goHome = React.useCallback(() => {
    router.push('/')
  }, [router])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      goHome()
    }
  }

  const handleSuccess = () => {
    setSuccess(true)
    // Redirect to home after 2 seconds
    setTimeout(goHome, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo-storyon.svg"
            alt="StoryOn logo"
            width={116}
            height={12}
            priority
            className="h-3 w-auto"
          />
        </div>

        {success ? (
          <div className="flex flex-col gap-7">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-[32px] font-semibold leading-display text-grey-950 mb-2.5">
                Heslo bylo změněno
              </h2>
              <p className="text-base leading-[1.5] text-text-subtle">
                Vaše heslo bylo úspěšně změněno. Za chvíli budete přesměrováni na úvodní stránku.
              </p>
            </div>
          </div>
        ) : (
          <ResetPasswordModal onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  )
}
