'use client'

import * as React from 'react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
          
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {title}
            </DialogTitle>
            
            {message && (
              <DialogDescription className="text-gray-600">
                {message}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <Button 
            onClick={() => onOpenChange(false)}
            className="mt-2"
            variant={type === 'error' ? 'destructive' : 'default'}
          >
            {buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

