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

type PreviewTab = 'text' | 'pdf'

export function LessonMaterialViewModal({
  open,
  onOpenChange,
  title,
  content,
  pdfUrl,
}: LessonMaterialViewModalProps) {
  const hasText = !!content
  const hasPdf = !!pdfUrl
  const [tab, setTab] = React.useState<PreviewTab>(hasText ? 'text' : 'pdf')

  // Default to whichever source exists whenever the modal is reopened for
  // another material.
  React.useEffect(() => {
    if (open) setTab(hasText ? 'text' : 'pdf')
  }, [open, hasText])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[960px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Náhled obsahu materiálu
          </DialogDescription>
        </DialogHeader>

        {hasText && hasPdf && (
          <div className="inline-flex self-start bg-grey-100 rounded-full p-1">
            {([
              ['text', 'Text k úpravě'],
              ['pdf', 'PDF ke stažení'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`px-6 h-9 rounded-full text-sm transition-all cursor-pointer whitespace-nowrap ${
                  tab === value
                    ? 'bg-brand-primary text-white shadow-sm font-semibold'
                    : 'text-grey-600 hover:text-grey-950'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {tab === 'pdf' && hasPdf ? (
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
          ) : hasText ? (
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
