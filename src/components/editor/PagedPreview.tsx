'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import './page-styles.css'

interface PagedPreviewProps {
  content: string
  title?: string
  className?: string
}

/**
 * Preview component that renders HTML content
 * on a styled A4 page card — matching how it will
 * look when printed or saved as PDF.
 */
export function PagedPreview({ content, className }: PagedPreviewProps) {
  if (!content) {
    return (
      <div className={cn('page-preview-container', className)}>
        <div className="page-preview-page" data-page-number="1">
          <p className="text-gray-400 italic">Prázdný obsah</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('page-preview-container', className)}>
      <div
        className="page-preview-page"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
