'use client'

import * as React from 'react'
import { NewsletterSubscribersSection } from '@/components/admin/NewsletterSubscribersSection'
import { AdminLessonsSection } from '@/components/admin/AdminLessonsSection'
import { AdminTabs, type AdminTabId } from '@/components/admin/AdminTabs'

export function AdminPageContent() {
  const [activeTab, setActiveTab] = React.useState<AdminTabId>('lessons')

  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
      {/* Header */}
      <div className="mb-10 md:mb-12 pt-10">
        <h1 className="text-4xl md:text-[44px] font-display font-semibold leading-display">
          Administrace
        </h1>
        <p className="mt-2 text-text-subtle">
          Správa newsletteru, lekcí a další admin nástroje
        </p>
      </div>

      {/* Layout with responsive tabs */}
      <div className="lg:flex lg:gap-10 mb-20">
        <div className="shrink-0">
          <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'lessons' && <AdminLessonsSection />}
          {activeTab === 'newsletter' && <NewsletterSubscribersSection />}
        </div>
      </div>
    </div>
  )
}
