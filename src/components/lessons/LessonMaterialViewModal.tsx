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
  pdfUrl?: string | null
}

export function LessonMaterialViewModal({
  open,
  onOpenChange,
  title,
  content,
  pdfUrl,
}: LessonMaterialViewModalProps) {
  // PDF takes precedence; text is only a fallback for materials without one
  // (e.g. user-edited copies).
  const hasPdf = !!pdfUrl

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
          {hasPdf ? (
            <div className="flex flex-col gap-2 h-full min-h-[60vh]">
              <iframe
                src={pdfUrl as string}
                title={`Náhled PDF: ${title}`}
                className="w-full flex-1 min-h-[60vh] rounded-lg border border-gray-200 bg-gray-50"
              />
              <a
                href={pdfUrl as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-primary hover:underline self-start"
              >
                Nezobrazuje se náhled? Otevřít PDF v novém okně
              </a>
            </div>
          ) : content ? (
            <PagedPreview title={title} content={content as string} paginate={false} />
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
