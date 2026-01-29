'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useIsAdmin } from '@/lib/supabase/hooks/useIsAdmin'
import { NewsletterSubscribersSection } from '@/components/admin/NewsletterSubscribersSection'

export default function AdminPage() {
  const router = useRouter()
  const { isAdmin, loading } = useIsAdmin()

  // Redirect if not admin
  React.useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/')
    }
  }, [loading, isAdmin, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Načítání...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

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
