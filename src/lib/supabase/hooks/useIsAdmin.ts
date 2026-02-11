'use client'

import * as React from 'react'
import { useAuth } from './useAuth'

/**
 * Hook to check if the current user is an admin
 * Returns { isAdmin, loading } state
 */
export function useIsAdmin() {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function checkAdmin() {
      if (!isLoggedIn) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/admin/check')
        const data = await response.json()
        setIsAdmin(data.isAdmin || false)
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      checkAdmin()
    }
  }, [isLoggedIn, authLoading])

  return { isAdmin, loading: authLoading || loading }
}
