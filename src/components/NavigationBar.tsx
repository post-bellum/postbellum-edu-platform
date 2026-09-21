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
import { BookmarkIconCustom as BookmarkIcon, MenuTwoLinesIcon } from '@/components/icons'
import { Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from '@/components/ui/Icons'
import { Bookmark, Pencil } from 'lucide-react'
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
    { href: '/', label: 'Domů' },
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
      <div className="w-full max-w-[1920px] mx-auto px-5 xl:px-10">
        <div className="flex h-12 items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center md:min-w-[240px]">
            <Link href="/">
              {/* Mobile logo */}
              <Image
                src="/logo-storyon-mobile.svg"
                alt="StoryOn"
                width={88}
                height={36}
                priority
                className="md:hidden"
              />
              {/* Desktop logo */}
              <Image
                src="/logo-storyon.svg"
                alt="StoryOn"
                width={200}
                height={36}
                priority
                className="hidden md:block"
              />
            </Link>
          </div>

          {/* Center - Navigation Links (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-7">
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
          <div className="hidden lg:flex items-center justify-end gap-2 lg:gap-4 lg:min-w-[240px]">
            {isLoggedIn ? (
              <>
                {/* Favorites Button */}
                <button
                  onClick={() => router.push('/favorites')}
                  className="flex items-center gap-0 bg-[#caffe6] rounded-full p-2 cursor-pointer hover:bg-mint transition-colors"
                  title="Oblíbené lekce"
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
          <div className="flex lg:hidden items-center gap-3">
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
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-surface hover:bg-grey-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset"
                  aria-label="Otevřít menu"
                >
                  <MenuTwoLinesIcon className="h-6 w-6 text-grey-950" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[340px] p-0">
                <SheetTitle className="sr-only">Navigace</SheetTitle>
                
                {/* Sheet Header with Logo - matches navbar layout */}
                <div className="flex h-12 items-center justify-between px-5 py-4 mt-4 -translate-x-px">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset focus-visible:rounded"
                  >
                    <Image
                      src="/logo-storyon-mobile.svg"
                      alt="StoryOn"
                      width={88}
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
                          'w-full text-left font-body text-md pl-2 pr-4 py-2.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset',
                          isActive(link.href)
                            ? 'font-semibold text-text-strong bg-[#caffe6]'
                            : 'font-normal text-text-subtle hover:bg-grey-50'
                        )}
                      >
                        {link.label}
                      </button>
                    ))}
                  </nav>

                  {/* Divider */}
                  <div className="h-px bg-grey-100" />

                  {/* User Actions */}
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-1">
                      {/* Profile Header */}
                      {email && (
                        <div className="flex items-center justify-between gap-3 pl-2 pr-4 py-2.5">
                          <span className="font-body text-md font-semibold text-text-strong truncate">
                            {profile?.displayName || email}
                          </span>
                          <Image
                            src={getGravatarUrl(email, 40)}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full border-[1.25px] border-grey-950"
                          />
                        </div>
                      )}

                      {/* Favorites */}
                      <button
                        onClick={() => handleMobileNavClick('/favorites')}
                        className="flex items-center gap-1.5 w-full text-left font-body text-md pl-2 pr-4 py-2.5 rounded-lg text-text-subtle hover:bg-grey-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset"
                      >
                        <span className="text-grey-600">
                          <Bookmark className="h-4 w-4" />
                        </span>
                        <span className="leading-normal">Oblíbené lekce</span>
                      </button>

                      {/* Edited Materials */}
                      <button
                        onClick={() => handleMobileNavClick('/profile?tab=materials')}
                        className="flex items-center gap-1.5 w-full text-left font-body text-md pl-2 pr-4 py-2.5 rounded-lg text-text-subtle hover:bg-grey-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset"
                      >
                        <span className="text-grey-600">
                          <Pencil className="h-4 w-4" />
                        </span>
                        <span className="leading-normal">Upravené materiály</span>
                      </button>

                      {/* Settings */}
                      <button
                        onClick={() => handleMobileNavClick('/profile')}
                        className="flex items-center gap-1.5 w-full text-left font-body text-md pl-2 pr-4 py-2.5 rounded-lg text-text-subtle hover:bg-grey-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset"
                      >
                        <span className="text-grey-600">
                          <Cog6ToothIcon className="h-4 w-4" />
                        </span>
                        <span className="leading-normal">Nastavení</span>
                      </button>

                      {/* Divider before logout */}
                      <div className="h-px bg-grey-100 my-1" />

                      {/* Logout */}
                      <button
                        onClick={async () => {
                          setMobileMenuOpen(false)
                          await logout()
                          router.push('/')
                          router.refresh()
                        }}
                        className="flex items-center gap-1.5 w-full text-left font-body text-md pl-2 pr-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-inset"
                      >
                        <span className="text-red-600">
                          <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                        </span>
                        <span className="leading-normal">Odhlásit se</span>
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
