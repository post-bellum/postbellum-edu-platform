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
import { PagedPreview } from '@/components/editor/PagedPreview'

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[960px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Náhled obsahu materiálu
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {content ? (
            <PagedPreview title={title} content={content} paginate={false} />
          ) : (
            <p className="text-gray-500 text-center py-8">
              Tento materiál nemá žádný obsah.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
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