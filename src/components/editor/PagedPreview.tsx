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
  /** When false, renders content as a single continuous scroll (no page breaks). Default: true */
  paginate?: boolean
}

/**
 * Preview component that renders HTML content.
 * When paginate=true: splits across multiple A4 page cards — matching printed/PDF.
 * When paginate=false: renders as a single continuous scroll without page breaks.
 */
export function PagedPreview({ content, className, paginate = true }: PagedPreviewProps) {
  const pages = usePreviewPagination(paginate ? content : '')

  if (!content) {
    return (
      <div className={cn('page-preview-container', className)}>
        <div className="page-preview-page" data-page-number="1">
          <p className="text-gray-400 italic">Prázdný obsah</p>
        </div>
      </div>
    )
  }

  if (!paginate) {
    return (
      <div className={cn('page-preview-container page-preview-continuous', className)}>
        <div
          className="page-preview-page page-preview-page-continuous"
          dangerouslySetInnerHTML={{ __html: content }}
        />
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
