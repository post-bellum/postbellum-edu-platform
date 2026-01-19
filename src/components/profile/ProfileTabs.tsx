'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type TabId = 'settings' | 'materials'

interface Tab {
  id: TabId
  label: string
}

const tabs: Tab[] = [
  { id: 'settings', label: 'Nastavení' },
  { id: 'materials', label: 'Moje upravené materiály' },
]

interface ProfileTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
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

