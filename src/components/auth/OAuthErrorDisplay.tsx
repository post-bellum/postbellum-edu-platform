"use client"

import { useSearchParams } from "next/navigation"

/**
 * Displays OAuth error messages from URL search params
 * Must be wrapped in a Suspense boundary
 */
export function OAuthErrorDisplay() {
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const errorMessage = searchParams.get('message') || searchParams.get('description')

  if (!oauthError) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
      <p className="text-sm font-medium text-red-800">
        Chyba přihlášení: {oauthError}
      </p>
      {errorMessage && (
        <p className="text-xs text-red-600 mt-1">
          {decodeURIComponent(errorMessage)}
        </p>
      )}
    </div>
  )
}

