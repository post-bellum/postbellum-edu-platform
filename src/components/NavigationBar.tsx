'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { useProfile } from '@/lib/supabase/hooks/useProfile'
import { cn } from '@/lib/utils'
import { AuthModal } from '@/components/auth'
import { Button } from '@/components/ui/Button'
import { ProfileDropdown } from '@/components/ProfileDropdown'
import { BookmarkIcon } from '@/components/ui/Icons'

interface NavigationBarProps {
  favoriteCount?: number
  userEmail?: string | null
}

export function NavigationBar({ favoriteCount = 0, userEmail }: NavigationBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const { profile } = useProfile(isLoggedIn)
  const [showAuthModal, setShowAuthModal] = React.useState(false)
  const [authDefaultStep, setAuthDefaultStep] = React.useState<'login' | 'register'>('login')

  // Use user email from hook if not provided as prop
  const email = userEmail || user?.email || ''

  const navLinks = [
    { href: '/', label: 'Domov' },
    { href: '/lessons', label: 'Katalog' },
    { href: '/about', label: 'O projektu' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleOpenAuth = (step: 'login' | 'register') => {
    setAuthDefaultStep(step)
    setShowAuthModal(true)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface py-4">
      <div className="w-full px-5 xl:px-10 2xl:px-[120px]">
        <div className="flex h-12 items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center md:min-w-[240px]">
            <Link href="/">
              <Image
                src="/logo-storyon.svg"
                alt="StoryOn"
                width={140}
                height={25}
                priority
              />
            </Link>
          </div>

          {/* Center - Navigation Links (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-body text-lg transition-colors p-1',
                  isActive(link.href)
                    ? 'font-semibold text-text-strong underline decoration-mint decoration-dotted underline-offset-[6px]'
                    : 'font-normal text-text-strong hover:text-text-subtle'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center justify-end gap-2 md:gap-4 md:min-w-[240px]">
            {isLoggedIn ? (
              <>
                {/* Favorites Button */}
                <button
                  onClick={() => router.push('/favorites')}
                  className="flex items-center gap-0 bg-[#caffe6] rounded-full p-2 cursor-pointer hover:bg-mint transition-colors"
                  title="Uložené lekce"
                >
                  <BookmarkIcon className="h-5 w-5 text-grey-950" />
                  {favoriteCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint text-xs font-semibold text-grey-950">
                      {favoriteCount > 99 ? '99+' : favoriteCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                {email && (
                  <ProfileDropdown 
                    email={email} 
                    displayName={profile?.displayName} 
                  />
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={() => handleOpenAuth('login')}
                >
                  Přihlásit
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={() => handleOpenAuth('register')}
                >
                  Registrovat
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultStep={authDefaultStep}
      />
    </nav>
  )
}
