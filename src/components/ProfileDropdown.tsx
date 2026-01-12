'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getGravatarUrl } from '@/lib/gravatar'
import { 
  DropdownMenu, 
  DropdownMenuItem, 
  DropdownMenuHeader,
  DropdownMenuSeparator 
} from '@/components/ui/DropdownMenu'
import { logout } from '@/lib/oauth-helpers'
import { BookmarkIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from '@/components/ui/Icons'

interface ProfileDropdownProps {
  email: string
  displayName?: string | null
}

export function ProfileDropdown({ email, displayName }: ProfileDropdownProps) {
  const router = useRouter()

  return (
    <DropdownMenu
      trigger={
        <div className="relative">
          <Image
            src={getGravatarUrl(email, 48)}
            alt="Profile"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full cursor-pointer border-[1.25px] border-grey-950 hover:ring-[3px] hover:ring-mint transition-all"
          />
        </div>
      }
    >
      <DropdownMenuHeader>
        {displayName || email}
      </DropdownMenuHeader>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => router.push('/favorites')}
        icon={<BookmarkIcon className="h-4 w-4" />}
      >
        Uložené lekce
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => router.push('/profile')}
        icon={<Cog6ToothIcon className="h-4 w-4" />}
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
        icon={<ArrowRightStartOnRectangleIcon className="h-4 w-4 text-red-600" />}
        variant="danger"
      >
        Odhlásit se
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
