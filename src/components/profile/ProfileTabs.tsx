'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Cog6ToothIcon } from '@/components/icons'
import { Pencil, Bookmark } from 'lucide-react'

type TabId = 'settings' | 'materials'

interface ProfileTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const isSettingsActive = activeTab === 'settings'
  const isMaterialsActive = activeTab === 'materials'

  return (
    <nav 
      className="flex md:flex-col gap-5 md:w-full md:max-w-[340px] overflow-x-auto md:overflow-visible mb-6 md:mb-0" 
      aria-label="Profile navigation" 
      data-testid="profile-tabs"
    >
      {/* Link to favorites page */}
      <Link
        href="/favorites"
        className="flex items-center gap-3 px-5 py-2 rounded-2xl text-lg transition-colors whitespace-nowrap md:w-full text-text-subtle hover:bg-grey-50"
        data-testid="profile-tab-favorites"
      >
        <Bookmark className="w-6 h-6" />
        <span className="md:hidden">Uložené</span>
        <span className="hidden md:inline">Uložené lekce</span>
      </Link>

      {/* Upravené materiály tab */}
      <button
        onClick={() => onTabChange('materials')}
        className={cn(
          'flex items-center gap-3 px-5 py-2 rounded-2xl text-lg transition-colors cursor-pointer whitespace-nowrap md:w-full',
          isMaterialsActive
            ? 'bg-turquoise-50 text-grey-950 font-semibold'
            : 'text-text-subtle hover:bg-grey-50'
        )}
        aria-current={isMaterialsActive ? 'page' : undefined}
        data-testid="profile-tab-materials"
      >
        <span className={cn(isMaterialsActive ? 'text-brand-primary' : 'text-text-subtle')}>
          <Pencil className="w-6 h-6" />
        </span>
        <span className="md:hidden">Upravené</span>
        <span className="hidden md:inline">Upravené materiály</span>
      </button>

      {/* Nastavení tab */}
      <button
        onClick={() => onTabChange('settings')}
        className={cn(
          'flex items-center gap-3 px-5 py-2 rounded-2xl text-lg transition-colors cursor-pointer whitespace-nowrap md:w-full',
          isSettingsActive
            ? 'bg-turquoise-50 text-grey-950 font-semibold'
            : 'text-text-subtle hover:bg-grey-50'
        )}
        aria-current={isSettingsActive ? 'page' : undefined}
        data-testid="profile-tab-settings"
      >
        <span className={cn(isSettingsActive ? 'text-brand-primary' : 'text-text-subtle')}>
          <Cog6ToothIcon className="w-6 h-6" />
        </span>
        <span>Nastavení</span>
      </button>
    </nav>
  )
}

export type { TabId }
