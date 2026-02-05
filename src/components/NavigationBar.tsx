'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { useProfile } from '@/lib/supabase/hooks/useProfile'
import { cn } from '@/lib/utils'
import { getGravatarUrl } from '@/lib/gravatar'
import { logout } from '@/lib/oauth-helpers'
import { AuthModal } from '@/components/auth'
import { Button } from '@/components/ui/Button'
import { ProfileDropdown } from '@/components/ProfileDropdown'
import { BookmarkIconCustom as BookmarkIcon, FileText, MenuTwoLinesIcon } from '@/components/icons'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/Sheet'

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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

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
    setMobileMenuOpen(false)
  }

  const handleMobileNavClick = (href: string) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface py-4">
      <div className="w-full max-w-[1920px] mx-auto px-5 md:px-10">
        <div className="flex h-12 items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center md:min-w-[240px]">
            <Link href="/">
              <Image
                src="/logo-storyon.svg"
                alt="StoryOn"
                width={200}
                height={36}
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
                    ? 'font-semibold text-text-strong underline decoration-mint decoration-2 decoration-dotted underline-offset-4'
                    : 'font-normal text-text-strong hover:text-text-subtle'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right - Actions (Desktop) */}
          <div className="hidden md:flex items-center justify-end gap-2 md:gap-4 md:min-w-[240px]">
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
                  variant="ultra"
                  size="medium"
                  onClick={() => handleOpenAuth('register')}
                >
                  Registrovat
                </Button>
              </div>
            )}
          </div>

          {/* Right - Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
            {/* Profile Image (mobile) - only when logged in */}
            {isLoggedIn && email && (
              <Image
                src={getGravatarUrl(email, 48)}
                alt="Profile"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full border-[1.25px] border-grey-950"
              />
            )}

            {/* Hamburger Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-surface hover:bg-grey-50 transition-colors"
                  aria-label="Otevřít menu"
                >
                  <MenuTwoLinesIcon className="h-6 w-6 text-grey-950" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[340px] p-0">
                <SheetTitle className="sr-only">Navigace</SheetTitle>
                
                {/* Sheet Header with Logo - matches navbar layout */}
                <div className="flex h-12 items-center justify-between px-5 py-4 mt-4">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <Image
                      src="/logo-storyon.svg"
                      alt="StoryOn"
                      width={200}
                      height={36}
                      priority
                    />
                  </Link>
                </div>

                <div className="flex flex-col gap-6 px-5 pt-4">
                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => handleMobileNavClick(link.href)}
                        className={cn(
                          'w-full text-left font-body text-xl px-4 py-3 rounded-xl transition-colors',
                          isActive(link.href)
                            ? 'font-semibold text-text-strong bg-[#caffe6]'
                            : 'font-normal text-text-strong hover:bg-grey-50'
                        )}
                      >
                        {link.label}
                      </button>
                    ))}
                  </nav>

                  {/* Divider */}
                  <div className="h-px bg-grey-200" />

                  {/* User Actions */}
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-2">
                      {/* Edited Materials */}
                      <button
                        onClick={() => handleMobileNavClick('/profile?tab=materials')}
                        className="flex items-center gap-3 w-full text-left font-body text-lg px-4 py-3 rounded-xl text-text-strong hover:bg-grey-50 transition-colors"
                      >
                        <span className="flex items-center justify-center w-8 h-8 bg-[#caffe6] rounded-full">
                          <FileText className="h-4 w-4 text-grey-950" />
                        </span>
                        <span>Moje upravené materiály</span>
                      </button>

                      {/* Settings */}
                      <button
                        onClick={() => handleMobileNavClick('/profile')}
                        className="flex items-center gap-3 w-full text-left font-body text-lg px-4 py-3 rounded-xl text-text-strong hover:bg-grey-50 transition-colors"
                      >
                        <span className="flex items-center justify-center w-8 h-8 bg-grey-100 rounded-full">
                          <svg className="h-4 w-4 text-grey-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                        <span>Nastavení</span>
                      </button>

                      {/* Divider before logout */}
                      <div className="h-px bg-grey-200 my-2" />

                      {/* Logout */}
                      <button
                        onClick={async () => {
                          setMobileMenuOpen(false)
                          await logout()
                          router.push('/')
                          router.refresh()
                        }}
                        className="flex items-center gap-3 w-full text-left font-body text-lg px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="flex items-center justify-center w-8 h-8 bg-red-50 rounded-full">
                          <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                        </span>
                        <span>Odhlásit se</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 px-4">
                      <Button
                        variant="ultra"
                        size="large"
                        onClick={() => handleOpenAuth('register')}
                        className="w-full"
                      >
                        Registrovat
                      </Button>
                      <Button
                        variant="secondary"
                        size="large"
                        onClick={() => handleOpenAuth('login')}
                        className="w-full"
                      >
                        Přihlásit
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
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
