'use client'

import { cn } from '@/lib/utils'
import { Mail, BookOpen, School, FileText } from 'lucide-react'

type AdminTabId = 'newsletter' | 'lessons' | 'schools' | 'content'

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
  {
    id: 'schools',
    label: 'Správa škol',
    shortLabel: 'Školy',
    icon: <School className="w-6 h-6" />
  },
  {
    id: 'content',
    label: 'Obsah stránek',
    shortLabel: 'Obsah',
    icon: <FileText className="w-6 h-6" />
  },
]

interface AdminTabsProps {
  activeTab: AdminTabId
  onTabChange: (tab: AdminTabId) => void
}

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  return (
    <nav 
      className="flex lg:flex-col gap-1 lg:gap-5 lg:w-full lg:max-w-[340px] overflow-x-auto lg:overflow-visible mb-6 lg:mb-0" 
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
              'flex items-center gap-1.5 lg:gap-3 pl-2 pr-4 lg:px-5 py-2.5 lg:py-2 rounded-lg lg:rounded-2xl text-md lg:text-lg transition-colors cursor-pointer whitespace-nowrap lg:w-full',
              isActive
                ? 'bg-turquoise-50 text-grey-950 font-semibold'
                : 'text-text-subtle hover:bg-grey-50'
            )}
            aria-current={isActive ? 'page' : undefined}
            data-testid={`admin-tab-${tab.id}`}
          >
            <span className={cn(isActive ? 'text-brand-primary' : 'text-grey-600', '[&>svg]:w-5 [&>svg]:h-5 lg:[&>svg]:w-6 lg:[&>svg]:h-6')}>
              {tab.icon}
            </span>
            <span className="leading-normal lg:hidden">{tab.shortLabel}</span>
            <span className="leading-normal hidden lg:inline">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export type { AdminTabId }
