'use client'

import * as React from 'react'
import {
  getMyNewsletterStatus,
  setMyNewsletterSubscription,
} from '@/app/actions/newsletter'
import { logger } from '@/lib/logger'

interface ToggleResult {
  success: boolean
  error?: string
}

export function useNewsletterSubscription(isLoggedIn: boolean) {
  const [isSubscribed, setIsSubscribed] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Load current status on mount / when auth state changes
  React.useEffect(() => {
    if (!isLoggedIn) return

    let cancelled = false
    setIsLoading(true)

    getMyNewsletterStatus()
      .then((result) => {
        if (!cancelled && result.success) {
          setIsSubscribed(result.isSubscribed)
        }
      })
      .catch((err) => {
        logger.error('Error loading newsletter status', err)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  // Optimistically toggle; revert on failure
  const toggle = React.useCallback(
    async (next: boolean): Promise<ToggleResult> => {
      setIsSaving(true)
      setIsSubscribed(next)

      try {
        const result = await setMyNewsletterSubscription(next)

        if (!result.success) {
          setIsSubscribed(!next)
          return { success: false, error: result.error }
        }

        setIsSubscribed(result.isSubscribed)
        return { success: true }
      } catch (err) {
        logger.error('Error updating newsletter subscription', err)
        setIsSubscribed(!next)
        return {
          success: false,
          error: 'Nepodařilo se změnit odběr. Zkuste to prosím znovu.',
        }
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  return { isSubscribed, isLoading, isSaving, toggle }
}
