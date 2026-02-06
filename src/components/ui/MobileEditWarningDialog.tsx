'use client'

import * as React from 'react'
import { Monitor } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

interface MobileEditWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileEditWarningDialog({ open, onOpenChange }: MobileEditWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-mint/10 flex items-center justify-center mb-4">
            <Monitor className="w-8 h-8 text-mint" />
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-display text-2xl">
              Úpravy pouze na počítači
            </DialogTitle>
            <DialogDescription className="text-base">
              Úpravy materiálů jsou dostupné pouze na počítači. Přejděte prosím na stolní počítač nebo notebook.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 w-full">
            <Button 
              variant="mint" 
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Rozumím
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
