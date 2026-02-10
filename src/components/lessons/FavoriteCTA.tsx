'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { AuthModal } from '@/components/auth'
import { LockOpen } from 'lucide-react'

interface FavoriteCTAProps {
  variant?: 'default' | 'sidebar'
}

export function FavoriteCTA({ variant = 'default' }: FavoriteCTAProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false)

  const handleModalClose = (open: boolean) => {
    setIsAuthModalOpen(open)
    // When modal closes, refresh to check if user is now logged in
    if (!open) {
      router.refresh()
    }
  }

  // Sidebar variant - registration banner card matching Figma design
  if (variant === 'sidebar') {
    return (
      <>
        <div className="bg-[#ddffee] border border-[rgba(12,17,29,0.05)] rounded-[28px] p-6 flex flex-col gap-4 overflow-hidden">
          {/* Lock Open Icon */}
          <LockOpen className="w-6 h-6 text-brand-primary" />

          {/* Illustration */}
          <Image
            src="/illustrations/lesson/registration-cta.png"
            alt="Ilustrace - odemkněte plný přístup"
            width={400}
            height={300}
            className="w-full h-auto -mt-4 -mb-2"
          />

          {/* Heading */}
          <h3 className="font-display text-2xl font-semibold leading-display text-text-strong">
            Upravujte materiály, ukládejte vlastní verze a zapojte se do hodnocení.
          </h3>

          {/* Subtitle */}
          <p className="font-body text-md leading-body text-[#052120]">
            Odemkněte si plný přístup k lekcím.
          </p>

          {/* Registration Button */}
          <Button
            variant="primary"
            size="medium"
            onClick={() => setIsAuthModalOpen(true)}
          >
            Registrovat
          </Button>
        </div>

        <AuthModal
          open={isAuthModalOpen}
          onOpenChange={handleModalClose}
          defaultStep="register"
          returnTo={pathname}
        />
      </>
    )
  }

  // Default variant - full CTA card
  return (
    <>
      <div className="bg-[#ddffee] border border-[rgba(12,17,29,0.05)] rounded-[28px] p-6 flex flex-col gap-4 overflow-hidden">
        {/* Lock Open Icon */}
        <LockOpen className="w-6 h-6 text-brand-primary" />

        {/* Illustration */}
        <Image
          src="/illustrations/lesson/registration-cta.png"
          alt="Ilustrace - odemkněte plný přístup"
          width={400}
          height={300}
          className="w-full h-auto -mt-4 -mb-2"
        />

        {/* Heading */}
        <h3 className="font-display text-2xl font-semibold leading-display text-text-strong">
          Upravujte materiály, ukládejte vlastní verze a zapojte se do hodnocení.
        </h3>

        {/* Subtitle */}
        <p className="font-body text-md leading-body text-[#052120]">
          Odemkněte si plný přístup k lekcím.
        </p>

        {/* Registration Button */}
        <Button
          variant="primary"
          size="medium"
          onClick={() => setIsAuthModalOpen(true)}
        >
          Registrovat
        </Button>
      </div>

      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={handleModalClose}
        defaultStep="register"
        returnTo={pathname}
      />
    </>
  )
}

