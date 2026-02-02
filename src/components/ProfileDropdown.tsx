'use client'

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
import { Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from '@/components/ui/Icons'
import { Bookmark, Pencil, Shield } from 'lucide-react'
import { useIsAdmin } from '@/lib/supabase/hooks/useIsAdmin'

interface ProfileDropdownProps {
  email: string
  displayName?: string | null
}

export function ProfileDropdown({ email, displayName }: ProfileDropdownProps) {
  const router = useRouter()
  const { isAdmin } = useIsAdmin()

  return (
    <DropdownMenu
      data-testid="profile-dropdown"
      trigger={
        <div className="relative" data-testid="profile-dropdown-trigger">
          <Image
            src={getGravatarUrl(email, 48)}
            alt="Profile"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full cursor-pointer border-[1.25px] border-grey-950 hover:ring-[3px] hover:ring-mint group-data-[state=open]:ring-[3px] group-data-[state=open]:ring-mint transition-all"
            data-testid="profile-avatar"
          />
        </div>
      }
    >
      <DropdownMenuHeader data-testid="profile-dropdown-header">
        {displayName || email}
      </DropdownMenuHeader>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => router.push('/favorites')}
        icon={<Bookmark className="h-4 w-4" />}
        data-testid="profile-dropdown-favorites"
      >
        Uložené lekce
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => router.push('/profile?tab=materials')}
        icon={<Pencil className="h-4 w-4" />}
        data-testid="profile-dropdown-edited-materials"
      >
        Upravené materiály
      </DropdownMenuItem>

      <DropdownMenuItem
        onClick={() => router.push('/profile')}
        icon={<Cog6ToothIcon className="h-4 w-4" />}
        data-testid="profile-dropdown-settings"
      >
        Nastavení
      </DropdownMenuItem>

      {isAdmin && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push('/admin')}
            icon={<Shield className="h-4 w-4" />}
            data-testid="profile-dropdown-admin"
          >
            Administrace
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={async () => {
          await logout()
          router.push('/')
          router.refresh()
        }}
        icon={<ArrowRightStartOnRectangleIcon className="h-4 w-4 text-red-600" />}
        variant="danger"
        data-testid="profile-dropdown-logout"
      >
        Odhlásit se
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
