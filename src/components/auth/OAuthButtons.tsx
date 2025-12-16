'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { GoogleIcon, MicrosoftIcon } from '@/components/ui/Icons'
import { handleOAuthLogin } from '@/lib/oauth-helpers'
import { logger } from '@/lib/logger'

interface OAuthButtonsProps {
  returnTo?: string
}

export function OAuthButtons({ returnTo }: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onOAuthClick = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true)
    setError(null)
    try {
      await handleOAuthLogin(provider, { returnTo })
    } catch (error) {
      logger.error(`OAuth login failed (${provider})`, error)
      setError('Přihlášení se nezdařilo. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  const providers = [
    { id: 'google' as const, icon: <GoogleIcon />, text: 'Přihlásit se pomocí Google' },
    { id: 'microsoft' as const, icon: <MicrosoftIcon />, text: 'Přihlásit se pomocí Microsoft účtu' },
  ]

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="w-full h-12 hover:bg-gray-50 transition-colors"
          onClick={() => onOAuthClick(provider.id)}
          disabled={isLoading}
          data-testid={`oauth-${provider.id}-button`}
        >
          {provider.icon}
          {provider.text}
        </Button>
      ))}
    </div>
  )
}
