'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { AuthModal } from '@/components/auth'
import { Lock, Bookmark } from 'lucide-react'

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

  // Sidebar variant - simple button that opens auth modal
  if (variant === 'sidebar') {
    return (
      <>
        <Button 
          variant="secondary" 
          size="medium" 
          className="w-full justify-center"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <Bookmark className="w-5 h-5" />
          Přidat do oblíbených
        </Button>

        <AuthModal 
          open={isAuthModalOpen} 
          onOpenChange={handleModalClose}
          defaultStep="login"
          returnTo={pathname}
        />
      </>
    )
  }

  // Default variant - full CTA card
  return (
    <>
      <div className="pt-4 border-t bg-gradient-to-br from-blue-50 to-indigo-50 -mx-6 -mb-6 px-6 pb-6 mt-4 rounded-b-lg">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Upravujte materiály, ukládejte vlastní verze a zapojte se do hodnocení.
            </h3>
            <p className="text-sm text-gray-600">
              Odemkněte si plný přístup k lekcím.
            </p>
          </div>
          <Button 
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full"
            size="lg"
          >
            Zaregistrovat
          </Button>
        </div>
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

