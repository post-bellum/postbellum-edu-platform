'use client'

import { cn } from '@/lib/utils'
import { Mail, BookOpen } from 'lucide-react'

type AdminTabId = 'newsletter' | 'lessons'

interface Tab {
  id: AdminTabId
  label: string
  shortLabel: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { 
    id: 'lessons', 
    label: 'Správa lekcí', 
    shortLabel: 'Lekce',
    icon: <BookOpen className="w-6 h-6" />
  },
  { 
    id: 'newsletter', 
    label: 'Newsletter', 
    shortLabel: 'Newsletter',
    icon: <Mail className="w-6 h-6" />
  },
]

interface AdminTabsProps {
  activeTab: AdminTabId
  onTabChange: (tab: AdminTabId) => void
}

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <nav 
      className="flex lg:flex-col gap-5 lg:w-full lg:max-w-[340px] overflow-x-auto lg:overflow-visible mb-6 lg:mb-0" 
      aria-label="Admin navigation" 
      data-testid="admin-tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-3 px-5 py-2 rounded-2xl font-semibold text-lg transition-colors cursor-pointer whitespace-nowrap lg:w-full',
              isActive
                ? 'bg-turquoise-50 text-grey-950'
                : 'text-text-subtle hover:bg-grey-50'
            )}
            aria-current={isActive ? 'page' : undefined}
            data-testid={`admin-tab-${tab.id}`}
          >
            <span className={cn(isActive ? 'text-brand-primary' : 'text-text-subtle')}>
              {tab.icon}
            </span>
            <span className="lg:hidden">{tab.shortLabel}</span>
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export type { AdminTabId }
