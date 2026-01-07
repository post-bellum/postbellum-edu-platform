'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/Button'
import { CheckCircleIcon } from '@/components/ui/Icons'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'success' | 'error'
  title: string
  message?: string
  buttonText?: string
}

export function FeedbackModal({ 
  open, 
  onOpenChange, 
  type,
  title, 
  message,
  buttonText = 'Zavřít'
}: FeedbackModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              type === 'success' && 'bg-green-100',
              type === 'error' && 'bg-red-100'
            )}>
              {type === 'success' && (
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              )}
              {type === 'error' && (
                <X className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {title}
            </Dialog.Title>
            
            {message && (
              <Dialog.Description className="text-gray-600">
                {message}
              </Dialog.Description>
            )}
            
            <Button 
              onClick={() => onOpenChange(false)}
              className="mt-2"
              variant={type === 'error' ? 'destructive' : 'default'}
            >
              {buttonText}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

