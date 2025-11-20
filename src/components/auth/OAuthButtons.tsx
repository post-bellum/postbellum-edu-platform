"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { GoogleIcon, MicrosoftIcon } from "@/components/ui/Icons"
import { handleOAuthLogin } from "@/lib/oauth-helpers"

export function OAuthButtons() {
  const [isLoading, setIsLoading] = React.useState(false)

  const onOAuthClick = async (provider: "google" | "microsoft") => {
    setIsLoading(true)
    try {
      await handleOAuthLogin(provider)
    } finally {
      setIsLoading(false)
    }
  }

  const providers = [
    { id: "google" as const, icon: <GoogleIcon />, text: "Přihlásit se pomocí Google" },
    { id: "microsoft" as const, icon: <MicrosoftIcon />, text: "Přihlásit se pomocí Microsoft účtu" },
  ]

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="w-full h-12 hover:bg-gray-50 transition-colors"
          onClick={() => onOAuthClick(provider.id)}
          disabled={isLoading}
        >
          {provider.icon}
          {provider.text}
        </Button>
      ))}
    </div>
  )
}
