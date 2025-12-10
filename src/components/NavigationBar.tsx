'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { getGravatarUrl } from '@/lib/gravatar'
import { cn } from '@/lib/utils'

interface NavigationBarProps {
  favoriteCount?: number
  userEmail?: string | null
}

export function NavigationBar({ favoriteCount = 0, userEmail }: NavigationBarProps) {
  const pathname = usePathname()
  const { user, isLoggedIn } = useAuth()

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

          {/* Right Side - Favorites and Profile */}
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <>
                {/* Favorites Link */}
                <Link
                  href="/favorites"
                  className="relative flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors"
                >
                  <span>Oblíbené lekce</span>
                  {favoriteCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-xs font-medium text-white">
                      {favoriteCount > 99 ? '99+' : favoriteCount}
                    </span>
                  )}
                </Link>

                {/* Profile Avatar */}
                {email && (
                  <Link href="/profile">
                    <Image
                      src={getGravatarUrl(email, 40)}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-900 transition-all"
                    />
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-blue-900 transition-colors"
              >
                Přihlásit se
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

