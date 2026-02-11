'use client'

/**
 * PaginationPlugin for Plate.js
 *
 * Uses render.aboveNodes to wrap each top-level block with a React component
 * that can optionally render a page break visual above the block content.
 *
 * This is React-compatible: page break visuals are real React components,
 * so they survive Slate re-renders (unlike raw DOM injection which React
 * removes on reconciliation).
 *
 * Works with the PaginationProvider context which is populated by the
 * usePagination hook.
 */

import * as React from 'react'
import { createContext, useContext } from 'react'
import { createPlatePlugin } from 'platejs/react'
import type { RenderElementProps } from 'platejs'
import type { PageBreakSet } from './usePagination'
import { PAGE_DIMS, PAGE_GAP } from './constants'

// ============================================================================
// Pagination Context
// ============================================================================

const PaginationContext = createContext<PageBreakSet>(new Set())

/**
 * Provider that makes page break data available to all PaginationWrapper
 * instances rendered inside the editor.
 */
export function PaginationProvider({
  pageBreaks,
  children,
}: {
  pageBreaks: PageBreakSet
  children: React.ReactNode
}) {
  return (
    <PaginationContext.Provider value={pageBreaks}>
      {children}
    </PaginationContext.Provider>
  )
}

// ============================================================================
// Page Break Visual (React component, not DOM injection)
// ============================================================================

/**
 * Visual separator between pages in the editor.
 *
 * Structure:
 *   ┌──────────────────────────┐
 *   │  bottom margin (white)   │  ← end of previous page
 *   ├──────────────────────────┤  ← bottom edge (box-shadow down)
 *   │     gap (gray) with      │
 *   │     page number label    │
 *   ├──────────────────────────┤  ← top edge (box-shadow up)
 *   │   top margin (white)     │  ← start of next page
 *   └──────────────────────────┘
 */
function PageBreakVisual({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <div
      className="plate-page-break"
      contentEditable={false}
      data-pagination-break="true"
      style={{
        marginLeft: `-${PAGE_DIMS.margin.left}px`,
        marginRight: `-${PAGE_DIMS.margin.right}px`,
      }}
    >
      <div
        className="plate-page-break__bottom-margin"
        style={{ height: `${PAGE_DIMS.margin.bottom}px` }}
      />
      <div className="plate-page-break__edge-bottom" />
      <div
        className="plate-page-break__gap"
        style={{ height: `${PAGE_GAP}px` }}
      >
        <div className="plate-page-break__page-number">
          Strana {pageNumber} / {totalPages}
        </div>
      </div>
      <div className="plate-page-break__edge-top" />
      <div
        className="plate-page-break__top-margin"
        style={{ height: `${PAGE_DIMS.margin.top}px` }}
      />
    </div>
  )
}

// ============================================================================
// aboveNodes wrapper function
// ============================================================================

/**
 * Top-level block types that get a pagination measurement wrapper.
 * Must match all types that can appear at the document root.
 */
const PAGINATED_TYPES = new Set([
  'p', 'h1', 'h2', 'h3', 'h4',
  'blockquote', 'hr', 'img', 'table', 'ul', 'ol',
])

/**
 * Plate render.aboveNodes function for pagination.
 *
 * Called once per element during rendering. The outer function
 * (this function) can use React hooks. The inner function (the
 * returned wrapper) cannot.
 *
 * For each top-level block:
 * 1. Wraps content in a div with data-pagination-block for measurement
 * 2. Conditionally renders a PageBreakVisual above the content
 */
export function usePaginationAboveNodes(
  props: RenderElementProps & { key: string },
) {
  const { element } = props
  const type = (element as Record<string, unknown>).type as string | undefined
  const elementId = (element as Record<string, unknown>).id as string | undefined

  // Read context in the outer function (hook-safe, called during render)
  const pageBreaks = useContext(PaginationContext)

  // Only wrap top-level paginated block types
  const isPaginated = type ? PAGINATED_TYPES.has(type) : false
  if (!isPaginated || !elementId) return undefined

  const isPageBreak = pageBreaks.has(elementId)

  // Calculate page number: count breaks before this element.
  // Set insertion order matches document order (built by usePagination).
  let pageNumber = 1
  if (isPageBreak) {
    for (const id of pageBreaks) {
      if (id === elementId) break
      pageNumber++
    }
  }

  const totalPages = pageBreaks.size + 1

  // Return the wrapper (inner function — must NOT use hooks)
  return function PaginationWrapper(wrapperProps: { children: React.ReactNode }) {
    return (
      <>
        {isPageBreak && (
          <PageBreakVisual pageNumber={pageNumber} totalPages={totalPages} />
        )}
        <div data-pagination-block={elementId}>
          {wrapperProps.children}
        </div>
      </>
    )
  }
}

// ============================================================================
// Plate Plugin
// ============================================================================

/**
 * Plate plugin that adds pagination wrappers to top-level blocks.
 * Must be registered AFTER DndPlugin so pagination wraps outside DnD.
 */
export const PaginationPlatePlugin = createPlatePlugin({
  key: 'pagination',
  render: {
    aboveNodes: usePaginationAboveNodes as never,
  },
})
