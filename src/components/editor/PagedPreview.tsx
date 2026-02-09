'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { usePreviewPagination } from './pagination/usePreviewPagination'
import { PAGE_DIMS } from './pagination/constants'
import './page-styles.css'

interface PagedPreviewProps {
  content: string
  title?: string
  className?: string
}

/**
 * Paginated preview component that renders HTML content
 * split across multiple A4 page cards — matching how it will
 * look when printed or saved as PDF.
 *
 * Uses off-screen measurement to split content into page-sized
 * chunks, then renders each chunk inside a styled page card
 * with page numbers.
 */
export function PagedPreview({ content, className }: PagedPreviewProps) {
  const pages = usePreviewPagination(content)

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
      {pages.map((page, index) => (
        <div key={index} className="page-preview-page-wrapper">
          <div
            className="page-preview-page"
            style={{
              width: PAGE_DIMS.width,
              minHeight: PAGE_DIMS.height,
              paddingTop: PAGE_DIMS.margin.top,
              paddingBottom: PAGE_DIMS.margin.bottom,
              paddingLeft: PAGE_DIMS.margin.left,
              paddingRight: PAGE_DIMS.margin.right,
            }}
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
          <div className="page-preview-page-number">
            {index + 1} / {pages.length}
          </div>
        </div>
      ))}
    </div>
  )
}
