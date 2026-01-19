'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type TabId = 'settings' | 'materials'

interface Tab {
  id: TabId
  label: string
  shortLabel: string
}

const tabs: Tab[] = [
  { id: 'settings', label: 'Nastavení', shortLabel: 'Nastavení' },
  { id: 'materials', label: 'Moje upravené materiály', shortLabel: 'Materiály' },
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
        className="flex gap-2 border-b border-grey-200 pb-2 mb-6 overflow-x-auto" 
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
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer whitespace-nowrap',
                isActive
                  ? 'bg-[#caffe6] text-grey-950'
                  : 'text-grey-600 hover:bg-grey-50 hover:text-grey-900'
              )}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`profile-tab-${tab.id}`}
            >
              {tab.shortLabel}
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="space-y-1" aria-label="Sidebar navigation" data-testid="profile-tabs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'w-full text-left px-4 py-3 rounded-md font-medium text-sm transition-colors cursor-pointer',
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
            aria-current={isActive ? 'page' : undefined}
            data-testid={`profile-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

export type { TabId }
