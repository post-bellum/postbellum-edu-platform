'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FeedbackModal } from '@/components/ui/FeedbackModal'

export function DeletedLessonFeedback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(false)
  const [lessonTitle, setLessonTitle] = React.useState('')
  const processedRef = React.useRef(false)

  React.useEffect(() => {
    const deleted = searchParams.get('deleted')
    // Guard against re-processing if already handled
    if (deleted && !processedRef.current) {
      processedRef.current = true
      setLessonTitle(deleted)
      setOpen(true)
      // Clean up URL without triggering a navigation
      const url = new URL(window.location.href)
      url.searchParams.delete('deleted')
      router.replace(url.pathname, { scroll: false })
    }
  }, [searchParams, router])

  return (
    <FeedbackModal
      open={open}
      onOpenChange={setOpen}
      type="success"
      title="Lekce byla smazána"
      message={lessonTitle ? `Lekce "${lessonTitle}" byla úspěšně odstraněna.` : 'Lekce byla úspěšně odstraněna.'}
    />
  )
}
