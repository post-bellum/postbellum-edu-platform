/**
 * usePagination Hook - Fixed Page System
 *
 * Creates a Word/Google Docs-like pagination experience with fixed A4 pages.
 *
 * Key principles:
 * - Pages are ALWAYS exactly 1123px tall (A4 at 96 DPI)
 * - Pages never resize - content flows to the next page
 * - At least 1 full page is always shown
 * - Pages are pre-allocated (always show 1 buffer page ahead)
 * - Instant visual feedback (minimal debounce)
 */

import { useState, useEffect, useCallback, useRef, type RefObject } from 'react'
import {
  PAGE_DIMS,
  USABLE_PAGE_HEIGHT,
  PAGE_GAP,
} from './constants'

/** Set of block element IDs that should show a page break above them. */
export type PageBreakSet = Set<string>

/** Minimum debounce for visual smoothness (1 frame at 60fps) */
const PAGINATION_DEBOUNCE_MS = 16

/**
 * Measures the height of a block element including margins.
 */
function getBlockHeight(element: Element): number {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element as HTMLElement)
  const marginTop = parseFloat(style.marginTop) || 0
  const marginBottom = parseFloat(style.marginBottom) || 0
  return rect.height + marginTop + marginBottom
}

/**
 * Calculate total height for N complete pages.
 * Each page is exactly PAGE_HEIGHT (1123px) with gaps between.
 */
function calculatePagesHeight(pageCount: number): number {
  if (pageCount <= 0) pageCount = 1

  // Each page: usable height (983px) + top/bottom margins (60+80)
  // Between pages: gap (40px) + margins that create the break visual (60+80)
  const PAGE_HEIGHT = PAGE_DIMS.height // 1123px
  const GAP_HEIGHT = PAGE_GAP // 40px

  // Total: N pages + (N-1) gaps
  return pageCount * PAGE_HEIGHT + (pageCount - 1) * GAP_HEIGHT
}

/**
 * Update the paper surface to show exactly N complete A4 pages.
 * Pages are FIXED height - they never resize.
 */
function updatePaperHeight(
  surfaceEl: HTMLElement | null,
  pageCount: number,
): void {
  if (!surfaceEl) return

  const totalHeight = calculatePagesHeight(pageCount)

  // Set exact height - pages are fixed, not flexible
  surfaceEl.style.height = `${totalHeight}px`
  surfaceEl.style.minHeight = `${totalHeight}px`
}

/**
 * Simple debounce with cancel.
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null
  const debounced = ((...args: unknown[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T & { cancel: () => void }
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  return debounced
}

/**
 * React hook that manages editor pagination with fixed A4 pages.
 *
 * Strategy:
 * - Measures content blocks and calculates which blocks overflow to next page
 * - Always pre-allocates complete pages (minimum 1 page)
 * - Adds buffer page when content approaches end of last page
 * - Pages are FIXED height (1123px) - they never resize
 *
 * @param editorRef - Ref to the Slate editor DOM element
 * @param surfaceRef - Ref to the paper surface container
 */
export function usePagination(
  editorRef: RefObject<HTMLElement | null>,
  surfaceRef: RefObject<HTMLElement | null>,
): PageBreakSet {
  const [pageBreaks, setPageBreaks] = useState<PageBreakSet>(new Set())
  const isRecalculating = useRef(false)

  const recalculate = useCallback(() => {
    const editorEl = editorRef.current
    if (!editorEl || !editorEl.isConnected) return

    // Prevent re-entrant calls
    if (isRecalculating.current) return
    isRecalculating.current = true

    try {
      // Query only content blocks (marked by PaginationPlugin wrapper)
      const blocks = editorEl.querySelectorAll('[data-pagination-block]')

      if (blocks.length === 0) {
        // Empty editor - show 1 complete page
        updatePaperHeight(surfaceRef.current, 1)
        setPageBreaks((prev) => (prev.size === 0 ? prev : new Set()))
        return
      }

      // Measure blocks and determine page breaks
      const newBreaks = new Set<string>()
      let currentPageHeight = 0
      let pageNumber = 1

      blocks.forEach((block) => {
        const height = getBlockHeight(block)
        const blockId = block.getAttribute('data-pagination-block') || ''

        // Check if this block would overflow the current page
        if (currentPageHeight > 0 && currentPageHeight + height > USABLE_PAGE_HEIGHT) {
          // This block starts a new page
          newBreaks.add(blockId)
          pageNumber++
          currentPageHeight = height
        } else {
          currentPageHeight += height
        }
      })

      // Calculate required pages:
      // - We need at least pageNumber pages (for content that has breaks)
      // - Add 1 buffer page if content fills more than 70% of last page
      const contentFillRatio = currentPageHeight / USABLE_PAGE_HEIGHT
      const needsBufferPage = contentFillRatio > 0.7
      const totalPages = needsBufferPage ? pageNumber + 1 : pageNumber

      // Set surface to show exactly N complete fixed pages
      updatePaperHeight(surfaceRef.current, totalPages)

      // Only update state if the set actually changed
      setPageBreaks((prev) => {
        if (prev.size !== newBreaks.size) return newBreaks
        for (const id of newBreaks) {
          if (!prev.has(id)) return newBreaks
        }
        return prev
      })
    } finally {
      isRecalculating.current = false
    }
  }, [editorRef, surfaceRef])

  useEffect(() => {
    const editorEl = editorRef.current
    if (!editorEl) return

    const debouncedRecalc = debounce(recalculate as (...args: unknown[]) => void, PAGINATION_DEBOUNCE_MS)

    // ResizeObserver catches image loads, font loads, resizes
    const resizeObserver = new ResizeObserver(() => {
      debouncedRecalc()
    })
    resizeObserver.observe(editorEl)

    // MutationObserver catches Slate content changes
    const mutationObserver = new MutationObserver(() => {
      debouncedRecalc()
    })
    mutationObserver.observe(editorEl, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: true,
    })

    // Initial calculation after mount
    const initialTimer = setTimeout(recalculate, 50)

    return () => {
      debouncedRecalc.cancel()
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      clearTimeout(initialTimer)
    }
  }, [editorRef, recalculate])

  return pageBreaks
}
