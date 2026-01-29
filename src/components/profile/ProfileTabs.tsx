'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Cog6ToothIcon, FileText } from '@/components/icons'

type TabId = 'settings' | 'materials'

interface Tab {
  id: TabId
  label: string
  shortLabel: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { 
    id: 'settings', 
    label: 'Nastavení', 
    shortLabel: 'Nastavení',
    icon: <Cog6ToothIcon className="w-6 h-6" />
  },
  { 
    id: 'materials', 
    label: 'Moje upravené materiály', 
    shortLabel: 'Materiály',
    icon: <FileText className="w-6 h-6" />
  },
]

interface ProfileTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  variant?: 'vertical' | 'horizontal'
}

export function ProfileTabs({ activeTab, onTabChange, variant = 'vertical' }: ProfileTabsProps) {
  if (variant === 'horizontal') {
    return (
      <nav 
        className="flex gap-5 mb-6 overflow-x-auto" 
        aria-label="Profile navigation" 
        data-testid="profile-tabs-mobile"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-3 px-5 py-2 rounded-2xl font-semibold text-lg transition-colors cursor-pointer whitespace-nowrap',
                isActive
                  ? 'bg-turquoise-50 text-grey-950'
                  : 'text-text-subtle hover:bg-grey-50'
              )}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`profile-tab-${tab.id}`}
            >
              <span className={cn(isActive ? 'text-brand-primary' : 'text-text-subtle')}>
                {tab.icon}
              </span>
              {tab.shortLabel}
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="space-y-5 w-full max-w-[340px]" aria-label="Sidebar navigation" data-testid="profile-tabs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'w-full flex items-center gap-3 px-5 py-2 rounded-2xl font-semibold text-lg leading-snug transition-colors cursor-pointer',
              isActive
                ? 'bg-turquoise-50 text-grey-950'
                : 'text-text-subtle hover:bg-grey-50'
            )}
            aria-current={isActive ? 'page' : undefined}
            data-testid={`profile-tab-${tab.id}`}
          >
            <span className={cn(isActive ? 'text-brand-primary' : 'text-text-subtle')}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

export type { TabId }
