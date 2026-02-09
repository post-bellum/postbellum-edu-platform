/**
 * usePreviewPagination Hook
 *
 * Takes HTML content and splits it into page-sized chunks by measuring
 * block element heights in an off-screen container.
 * Ported from richtexteditor's usePreviewPagination.ts.
 *
 * Used by PagedPreview to render each chunk as a separate page card.
 */

import { useState, useEffect } from 'react'
import { USABLE_PAGE_HEIGHT, USABLE_PAGE_WIDTH } from './constants'

interface PageContent {
  html: string
}

/**
 * Splits HTML content into page-sized chunks for preview rendering.
 *
 * Algorithm:
 * 1. Creates an off-screen container matching the usable content width
 * 2. Injects the HTML content
 * 3. Iterates top-level block elements, measuring heights
 * 4. When cumulative height exceeds usable page height, starts a new page
 * 5. Returns an array of HTML strings, one per page
 *
 * @param content - HTML content to paginate
 * @returns Array of page HTML strings
 */
export function usePreviewPagination(content: string): PageContent[] {
  const [pages, setPages] = useState<PageContent[]>([{ html: content }])

  useEffect(() => {
    if (!content || typeof window === 'undefined') {
      return
    }

    // Create off-screen measurement container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = `${USABLE_PAGE_WIDTH}px`
    // Match the editor/preview typography
    container.style.fontSize = '16px'
    container.style.lineHeight = '1.75'
    container.style.fontFamily =
      "'tablet-gothic-wide', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    container.style.color = '#18181b'
    container.innerHTML = content
    document.body.appendChild(container)

    const children = Array.from(container.children) as HTMLElement[]
    const resultPages: PageContent[] = []
    let currentPageHtml = ''
    let currentHeight = 0

    for (const child of children) {
      const style = window.getComputedStyle(child)
      const marginTop = parseFloat(style.marginTop) || 0
      const marginBottom = parseFloat(style.marginBottom) || 0
      const height =
        child.getBoundingClientRect().height + marginTop + marginBottom

      if (currentHeight > 0 && currentHeight + height > USABLE_PAGE_HEIGHT) {
        // Start a new page
        resultPages.push({ html: currentPageHtml })
        currentPageHtml = child.outerHTML
        currentHeight = height
      } else {
        currentPageHtml += child.outerHTML
        currentHeight += height
      }
    }

    // Push the last page
    if (currentPageHtml) {
      resultPages.push({ html: currentPageHtml })
    }

    // Ensure at least one page
    if (resultPages.length === 0) {
      resultPages.push({ html: content })
    }

    // Cleanup DOM before updating state
    document.body.removeChild(container)

    // Update state with computed pages
    // Note: We need to measure DOM in an effect, so setState here is necessary
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPages(resultPages)
  }, [content])

  return pages
}
