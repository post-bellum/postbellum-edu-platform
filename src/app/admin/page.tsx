'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { NewsletterSubscribersSection } from '@/components/admin/NewsletterSubscribersSection'

export default function AdminPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [checkingAdmin, setCheckingAdmin] = React.useState(true)

  React.useEffect(() => {
    async function checkAdmin() {
      if (!isLoggedIn) {
        setCheckingAdmin(false)
        return
      }

      try {
        const response = await fetch('/api/admin/check')
        const data = await response.json()
        setIsAdmin(data.isAdmin || false)
      } catch {
        setIsAdmin(false)
      } finally {
        setCheckingAdmin(false)
      }
    }

    if (!authLoading) {
      checkAdmin()
    }
  }, [isLoggedIn, authLoading])

  // Redirect if not logged in or not admin
  React.useEffect(() => {
    if (!authLoading && !checkingAdmin) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/')
      }
    }
  }, [authLoading, checkingAdmin, isLoggedIn, isAdmin, router])

  if (authLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Načítání...</p>
      </div>
    )
  }

  if (!isLoggedIn || !isAdmin) {
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
