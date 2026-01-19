'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircleIcon } from '@/components/ui/Icons'

interface SuccessModalProps {
  onSuccess: () => void
}

export function SuccessModal({ onSuccess }: SuccessModalProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircleIcon className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-semibold text-center">Registrace úspěšná!</h2>
      <p className="text-center text-text-secondary">
        Vaše registrace byla úspěšně dokončena. Můžete pokračovat na svůj dashboard.
      </p>
      <Button
        onClick={onSuccess}
        className="mt-4"
        size="lg"
        data-testid="success-continue-button"
      >
        Pokračovat na dashboard
      </Button>
    </div>
  )
}

