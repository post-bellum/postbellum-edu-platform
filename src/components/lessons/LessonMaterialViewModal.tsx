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
import { sanitizeHTML } from '@/lib/sanitize'

interface LessonMaterialViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  content: string | null
}

export function LessonMaterialViewModal({
  open,
  onOpenChange,
  title,
  content,
}: LessonMaterialViewModalProps) {
  const sanitizedContent = React.useMemo(() => {
    if (!content) return ''
    return sanitizeHTML(content)
  }, [content])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Náhled obsahu materiálu
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {sanitizedContent ? (
            <div
              className="lesson-material-content bg-white p-6 rounded-lg"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">
              Tento materiál nemá žádný obsah.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Zavřít
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
