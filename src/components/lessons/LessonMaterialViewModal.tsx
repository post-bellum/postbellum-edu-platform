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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              margin: 0;
              padding: 0;
            }
            .print-content {
              width: 100%;
              max-width: 100%;
            }
            h1 { font-size: 2em; margin-top: 0; margin-bottom: 0.5em; }
            h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; }
            h3 { font-size: 1.25em; margin-top: 1.25em; margin-bottom: 0.5em; }
            p { margin: 1em 0; }
            ul, ol { margin: 1em 0; padding-left: 2em; }
            li { margin: 0.5em 0; }
            img { max-width: 100%; height: auto; page-break-inside: avoid; }
            a { color: #075985; text-decoration: underline; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            <h1>${title}</h1>
            ${sanitizedContent}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Náhled obsahu materiálu
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 flex justify-center">
          {sanitizedContent ? (
            <div className="a4-paper">
              <div
                className="a4-content lesson-material-content"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>
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
            onClick={handlePrint}
            disabled={!sanitizedContent}
          >
            Tisknout
          </Button>
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

