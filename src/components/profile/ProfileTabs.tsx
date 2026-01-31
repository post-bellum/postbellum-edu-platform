'use client'

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
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <nav 
      className="flex md:flex-col gap-5 md:w-full md:max-w-[340px] overflow-x-auto md:overflow-visible mb-6 md:mb-0" 
      aria-label="Profile navigation" 
      data-testid="profile-tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-3 px-5 py-2 rounded-2xl font-semibold text-lg transition-colors cursor-pointer whitespace-nowrap md:w-full',
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
            <span className="md:hidden">{tab.shortLabel}</span>
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export type { TabId }
