'use client'

import { cn } from '@/lib/utils'
import type { PageSlug } from '@/types/page-content.types'

const subTabs: { id: PageSlug; label: string }[] = [
  { id: 'homepage', label: 'Hlavni strana' },
  { id: 'about', label: 'O projektu' },
  { id: 'terms', label: 'Smluvni podminky' },
]

interface PageContentSubTabsProps {
  activeTab: PageSlug
  onTabChange: (tab: PageSlug) => void
}

export function PageContentSubTabs({ activeTab, onTabChange }: PageContentSubTabsProps) {
  return (
    <div className="flex gap-1 border-b border-grey-200 mb-6">
      {subTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer rounded-t-lg',
            activeTab === tab.id
              ? 'bg-white border border-grey-200 border-b-white text-brand-primary -mb-px'
              : 'text-text-subtle hover:text-text-strong hover:bg-grey-50'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
