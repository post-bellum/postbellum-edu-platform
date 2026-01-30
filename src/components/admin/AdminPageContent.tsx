'use client'

import { NewsletterSubscribersSection } from '@/components/admin/NewsletterSubscribersSection'

export function AdminPageContent() {
  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5">
      {/* Header */}
      <div className="mb-10 md:mb-12 pt-10">
        <h1 className="text-4xl md:text-[44px] font-display font-semibold leading-display">
          Administrace
        </h1>
        <p className="mt-2 text-text-subtle">
          Správa newsletteru a další admin nástroje
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 mb-20">
        <NewsletterSubscribersSection />
      </div>
    </div>
  )
}
