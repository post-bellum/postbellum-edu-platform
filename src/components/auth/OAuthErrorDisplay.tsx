"use client"

import { useSearchParams } from "next/navigation"
import { OAUTH_ERROR_MESSAGES } from "@/lib/constants"

/**
 * Displays OAuth error messages from URL search params
 * Must be wrapped in a Suspense boundary
 */
export function OAuthErrorDisplay() {
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const errorMessage = searchParams.get('message') || searchParams.get('description')

  if (!oauthError) return null

  // Get user-friendly Czech error message
  const friendlyError = OAUTH_ERROR_MESSAGES[oauthError] || 
    'Došlo k neočekávané chybě při přihlášení. Zkuste to prosím znovu.'

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
      <p className="text-sm font-medium text-red-800">
        {friendlyError}
      </p>
      {errorMessage && (
        <p className="text-xs text-red-600 mt-1">
          Detaily: {decodeURIComponent(errorMessage)}
        </p>
      )}
    </div>
  )
}

