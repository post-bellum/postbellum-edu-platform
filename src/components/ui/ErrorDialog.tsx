'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

interface ErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message?: string | null
  actionLabel?: string
  onAction?: () => void
}

export function ErrorDialog({
  open,
  onOpenChange,
  title = 'Akce se nezdařila',
  message = 'Nastala neočekávaná chyba',
  actionLabel = 'Zavřít',
  onAction,
}: ErrorDialogProps) {
  const handleClose = () => {
    onOpenChange(false)
  }

  const handleAction = () => {
    if (onAction) {
      onAction()
    }
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleAction}>
            {actionLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
