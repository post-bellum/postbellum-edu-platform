'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { useProfile } from '@/lib/supabase/hooks/useProfile'
import { getGravatarUrl } from '@/lib/gravatar'
import { cn } from '@/lib/utils'
import { AuthModal } from '@/components/auth'
import { 
  DropdownMenu, 
  DropdownMenuItem, 
  DropdownMenuHeader,
  DropdownMenuSeparator 
} from '@/components/ui/DropdownMenu'
import { logout } from '@/lib/oauth-helpers'
import { BookmarkIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from '@/components/ui/Icons'

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

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-900"></div>
              <div className="h-2 w-2 rounded-full bg-blue-900"></div>
              <div className="h-2 w-2 rounded-full bg-blue-900"></div>
            </div>
            <span className="text-xl font-serif text-blue-900">Post Bellum</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-blue-900',
                  isActive(link.href)
                    ? 'text-blue-900'
                    : 'text-gray-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Favorites Badge and Profile/Login */}
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <>
                {/* Favorites Button */}
                <button
                  onClick={() => router.push('/favorites')}
                  className="relative flex items-center gap-2 cursor-pointer hover:text-blue-900 transition-colors"
                  title="Uložené lekce"
                >
                  <BookmarkIcon className="h-5 w-5 text-gray-600" />
                  {favoriteCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-800">
                      {favoriteCount > 99 ? '99+' : favoriteCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                {email && (
                  <DropdownMenu
                    trigger={
                      <Image
                        src={getGravatarUrl(email, 40)}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-green-600 transition-all"
                      />
                    }
                  >
                    <DropdownMenuHeader>
                      {profile?.displayName || email}
                    </DropdownMenuHeader>

                    <DropdownMenuItem
                      onClick={() => router.push('/favorites')}
                      icon={<BookmarkIcon className="h-5 w-5" />}
                    >
                      Uložené lekce
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => router.push('/profile')}
                      icon={<Cog6ToothIcon className="h-5 w-5" />}
                    >
                      Nastavení
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={async () => {
                        await logout()
                        router.push('/')
                        router.refresh()
                      }}
                      icon={<ArrowRightStartOnRectangleIcon className="h-5 w-5" />}
                      variant="danger"
                    >
                      Odhlásit se
                    </DropdownMenuItem>
                  </DropdownMenu>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors cursor-pointer"
              >
                Přihlásit se
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultStep="login"
      />
    </nav>
  )
}

