'use client'

import * as React from 'react'
import { AdditionalActivity } from '@/types/lesson.types'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Download, ImageIcon } from 'lucide-react'

interface AdditionalActivitiesSectionProps {
  activities: AdditionalActivity[]
}

function isPdfAttachment(activity: AdditionalActivity): boolean {
  return activity.attachment_type === 'pdf'
}

export function AdditionalActivitiesSection({ activities }: AdditionalActivitiesSectionProps) {
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = React.useState<string>('')

  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url)
    setPreviewTitle(title)
    setPreviewOpen(true)
  }
  const closePreview = () => {
    setPreviewOpen(false)
    setPreviewUrl(null)
    setPreviewTitle('')
  }

  if (activities.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-7">
      <h2 className="font-display text-3xl font-semibold leading-display text-grey-950 pl-7">
        Doplňkové aktivity pro žáky
      </h2>

      <div className="flex flex-col gap-5">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-grey-100 border border-black/5 rounded-[28px] px-7 py-10"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  {activity.image_url && isPdfAttachment(activity) && (
                    <div className="w-7 h-7 shrink-0 rounded bg-red-100 flex items-center justify-center">
                      <Download className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-text-strong leading-display">
                    {activity.title}
                  </h3>
                </div>

                {activity.description && (
                  <p className="text-text-subtle text-lg leading-headline">
                    {activity.description}
                  </p>
                )}
              </div>

              <div className="lg:w-[180px] shrink-0 flex flex-col items-stretch justify-center gap-3">
                {activity.image_url ? (
                  isPdfAttachment(activity) ? (
                    <Button variant="secondary" size="medium" className="w-full" asChild>
                      <a
                        href={activity.image_url}
                        download={activity.title.replace(/[^a-z0-9\u00C0-\u024F.-]/gi, '_') + '.pdf'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Stáhnout PDF
                      </a>
                    </Button>
                  ) : (
                    <>
                      <div className="w-full aspect-square max-w-[180px] rounded-xl overflow-hidden border border-black/5 bg-grey-50 flex items-center justify-center mx-auto lg:mx-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activity.image_url}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="medium"
                        className="w-full"
                        onClick={() => openPreview(activity.image_url!, activity.title)}
                      >
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Zvětšit
                      </Button>
                    </>
                  )
                ) : (
                  <Button variant="secondary" size="medium" className="w-full" disabled>
                    Bez odkazu
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={previewOpen} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle className="truncate">{previewTitle}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="min-h-0 min-w-0 flex flex-1 items-center justify-center overflow-auto rounded-lg bg-grey-100 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={previewTitle}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
