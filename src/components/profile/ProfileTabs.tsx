'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Cog6ToothIcon } from '@/components/icons'
import { Pencil, Bookmark } from 'lucide-react'

type TabId = 'favorites' | 'settings' | 'materials'

interface ProfileTabsProps {
  activeTab: TabId
  onTabChange?: (tab: TabId) => void
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const isFavoritesActive = activeTab === 'favorites'
  const isSettingsActive = activeTab === 'settings'
  const isMaterialsActive = activeTab === 'materials'
  
  // When on favorites page, materials and settings should be links
  const isOnFavoritesPage = activeTab === 'favorites'

  return (
    <nav 
      className="flex md:flex-col gap-1 md:gap-5 md:w-full md:max-w-[340px] overflow-x-auto md:overflow-visible mb-6 md:mb-0" 
      aria-label="Profile navigation" 
      data-testid="profile-tabs"
    >
      {/* Link to favorites page */}
      <Link
        href="/favorites"
        className={cn(
          'flex items-center gap-1.5 md:gap-3 pl-2 pr-4 md:px-5 py-2.5 md:py-2 rounded-lg md:rounded-2xl text-md md:text-lg transition-colors whitespace-nowrap md:w-full',
          isFavoritesActive
            ? 'bg-turquoise-50 text-grey-950 font-semibold'
            : 'text-text-subtle hover:bg-grey-50'
        )}
        aria-current={isFavoritesActive ? 'page' : undefined}
        data-testid="profile-tab-favorites"
      >
        <span className={cn(isFavoritesActive ? 'text-brand-primary' : 'text-grey-600')}>
          <Bookmark className="w-5 h-5 md:w-6 md:h-6" />
        </span>
        <span className="leading-normal md:hidden">Uložené</span>
        <span className="leading-normal hidden md:inline">Uložené lekce</span>
      </Link>

      {/* Upravené materiály tab */}
      {isOnFavoritesPage ? (
        <Link
          href="/profile?tab=materials"
          className="flex items-center gap-1.5 md:gap-3 pl-2 pr-4 md:px-5 py-2.5 md:py-2 rounded-lg md:rounded-2xl text-md md:text-lg transition-colors whitespace-nowrap md:w-full text-text-subtle hover:bg-grey-50"
          data-testid="profile-tab-materials"
        >
          <span className="text-grey-600">
            <Pencil className="w-5 h-5 md:w-6 md:h-6" />
          </span>
          <span className="leading-normal md:hidden">Upravené</span>
          <span className="leading-normal hidden md:inline">Upravené materiály</span>
        </Link>
      ) : (
        <button
          onClick={() => onTabChange?.('materials')}
          className={cn(
            'flex items-center gap-1.5 md:gap-3 pl-2 pr-4 md:px-5 py-2.5 md:py-2 rounded-lg md:rounded-2xl text-md md:text-lg transition-colors cursor-pointer whitespace-nowrap md:w-full',
            isMaterialsActive
              ? 'bg-turquoise-50 text-grey-950 font-semibold'
              : 'text-text-subtle hover:bg-grey-50'
          )}
          aria-current={isMaterialsActive ? 'page' : undefined}
          data-testid="profile-tab-materials"
        >
          <span className={cn(isMaterialsActive ? 'text-brand-primary' : 'text-grey-600')}>
            <Pencil className="w-5 h-5 md:w-6 md:h-6" />
          </span>
          <span className="leading-normal md:hidden">Upravené</span>
          <span className="leading-normal hidden md:inline">Upravené materiály</span>
        </button>
      )}

      {/* Nastavení tab */}
      {isOnFavoritesPage ? (
        <Link
          href="/profile?tab=settings"
          className="flex items-center gap-1.5 md:gap-3 pl-2 pr-4 md:px-5 py-2.5 md:py-2 rounded-lg md:rounded-2xl text-md md:text-lg transition-colors whitespace-nowrap md:w-full text-text-subtle hover:bg-grey-50"
          data-testid="profile-tab-settings"
        >
          <span className="text-grey-600">
            <Cog6ToothIcon className="w-5 h-5 md:w-6 md:h-6" />
          </span>
          <span className="leading-normal">Nastavení</span>
        </Link>
      ) : (
        <button
          onClick={() => onTabChange?.('settings')}
          className={cn(
            'flex items-center gap-1.5 md:gap-3 pl-2 pr-4 md:px-5 py-2.5 md:py-2 rounded-lg md:rounded-2xl text-md md:text-lg transition-colors cursor-pointer whitespace-nowrap md:w-full',
            isSettingsActive
              ? 'bg-turquoise-50 text-grey-950 font-semibold'
              : 'text-text-subtle hover:bg-grey-50'
          )}
          aria-current={isSettingsActive ? 'page' : undefined}
          data-testid="profile-tab-settings"
        >
          <span className={cn(isSettingsActive ? 'text-brand-primary' : 'text-grey-600')}>
            <Cog6ToothIcon className="w-5 h-5 md:w-6 md:h-6" />
          </span>
          <span className="leading-normal">Nastavení</span>
        </button>
      )}
    </nav>
  )
}

export type { TabId }
