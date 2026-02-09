'use client'

import * as React from 'react'
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
    { id: 'google' as const, icon: <GoogleIcon />, text: 'Pokračovat s Google' },
    { id: 'microsoft' as const, icon: <MicrosoftIcon />, text: 'Pokračovat s Microsoft' },
  ]

  return (
    <div className="flex flex-col gap-1.5">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-2">
          {error}
        </div>
      )}
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className="w-full h-[52px] bg-grey-100 border-[1.5px] border-grey-200 rounded-full flex items-center justify-center gap-2.5 px-10 pt-[10px] pb-[11px] hover:bg-grey-200 hover:border-grey-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onOAuthClick(provider.id)}
          disabled={isLoading}
          data-testid={`oauth-${provider.id}-button`}
        >
          <span className="size-5 flex items-center justify-center">{provider.icon}</span>
          <span className="text-lg font-semibold leading-7 text-grey-950">{provider.text}</span>
        </button>
      ))}
    </div>
  )
}
