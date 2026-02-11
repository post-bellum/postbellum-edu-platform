/**
 * PDF Export Utilities
 *
 * Uses html2canvas-pro + pdf-lib for page-by-page PDF rendering.
 *
 * Algorithm:
 * 1. Clones editor HTML content into an off-screen container
 * 2. Measures each top-level block element's height
 * 3. Splits blocks into page-sized groups (with room for header/footer)
 * 4. Injects header (StoryON logo) and footer (text + pagination)
 * 5. Captures each page with html2canvas-pro at 2x resolution
 * 6. Assembles all page images into a pdf-lib document
 * 7. Downloads the PDF directly (no print dialog)
 */

import { logger } from '@/lib/logger'
import {
  PAGE_DIMS,
  USABLE_PAGE_HEIGHT,
  USABLE_PAGE_WIDTH,
} from '@/components/editor/pagination/constants'

// ============================================================================
// Page dimensions (imported from shared constants)
// ============================================================================

const PAGE_WIDTH = PAGE_DIMS.width  // 850px - A4 width (scaled for screen display)
const PAGE_HEIGHT = PAGE_DIMS.height // 1202px - A4 height (maintains 1:1.414 ratio)
const MARGIN_TOP = PAGE_DIMS.margin.top // 60px
const MARGIN_BOTTOM = PAGE_DIMS.margin.bottom // 80px
const MARGIN_LEFT = PAGE_DIMS.margin.left // 60px
const MARGIN_RIGHT = PAGE_DIMS.margin.right // 60px
const USABLE_WIDTH = USABLE_PAGE_WIDTH // 730px


// ============================================================================
// Shared print styles (used by browser print dialog)
// Must match preview/PDF styles for consistency
// ============================================================================

const PRINT_STYLES = `
  @page {
    size: A4;
    margin: 60px 60px 80px;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'tablet-gothic-wide', ui-sans-serif, system-ui,
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    line-height: 1.75;
    color: #18181b;
    margin: 0;
    padding: 0;
    background: white;
  }

  h1, h2, h3, h4 {
    page-break-after: avoid;
    break-after: avoid;
    clear: both;
  }

  h1 {
    font-family: 'tablet-gothic-narrow', system-ui, sans-serif;
    font-size: 28px;
    font-weight: 700;
    margin-top: 1.5em;
    margin-bottom: 0.75em;
    line-height: 1.2;
  }

  h1.document-title {
    font-size: 36px;
    margin-top: 2em;
    margin-bottom: 0.5em;
  }

  h2 {
    font-family: 'tablet-gothic-narrow', system-ui, sans-serif;
    font-size: 24px;
    font-weight: 600;
    margin-top: 1.25em;
    margin-bottom: 0.5em;
    line-height: 1.3;
  }

  h3 {
    font-family: 'tablet-gothic-narrow', system-ui, sans-serif;
    font-size: 20px;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
    line-height: 1.4;
  }

  h4 {
    font-family: 'tablet-gothic-narrow', system-ui, sans-serif;
    font-size: 18px;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }

  /* Remove top margin from first heading in content */
  body > h1:first-child,
  body > h2:first-child,
  body > h3:first-child,
  body > h4:first-child {
    margin-top: 0;
  }

  p {
    margin: 1em 0;
    line-height: 1.75;
    min-height: 1.75em; /* Ensure empty paragraphs are visible */
    orphans: 3;
    widows: 3;
  }

  ul, ol {
    padding-left: 1.5em;
    margin: 1em 0;
  }

  ul { list-style-type: disc; }
  ol { list-style-type: decimal; }

  li {
    margin: 0.5em 0;
    page-break-inside: avoid;
  }

  li::marker {
    font-family: system-ui, sans-serif;
    font-size: 1em;
  }

  a {
    color: #075985;
    text-decoration: underline;
  }

  mark {
    background-color: oklch(0.852 0.199 91.936 / 0.3);
    color: inherit;
    padding: 0.1em 0;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 0.5em 0;
    page-break-inside: avoid;
  }

  img.img-align-left {
    float: left;
    margin: 0.5em 1.5em 1em 0;
    max-width: 50%;
  }

  img.img-align-right {
    float: right;
    margin: 0.5em 0 1em 1.5em;
    max-width: 50%;
  }

  img.img-align-center {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    margin: 1em 0;
    table-layout: fixed;
    page-break-inside: avoid;
  }

  th, td {
    border: 1px solid #d1d5db;
    padding: 0.75em;
    vertical-align: top;
    text-align: left;
    page-break-inside: avoid;
  }

  th {
    background-color: #f3f4f6;
    font-weight: 600;
  }

  tr {
    page-break-inside: avoid;
  }

  blockquote {
    border-left: 4px solid #d1d5db;
    margin: 1em 0;
    padding-left: 1em;
    color: #6b7280;
    font-style: italic;
    page-break-inside: avoid;
  }

  code {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }

  strong, b { font-weight: 600; }
  em, i { font-style: italic; }
  u { text-decoration: underline; }

  .page-break-after {
    page-break-after: always;
    break-after: page;
    height: 0;
    margin: 0;
    padding: 0;
  }

  @media print {
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }
`

// ============================================================================
// PDF content styles (injected into document during html2canvas capture)
// ============================================================================

/**
 * CSS styles applied during PDF rendering.
 * MUST MATCH the preview styles exactly (.page-preview-page in page-styles.css)
 * to ensure preview looks identical to exported PDF.
 */
const PDF_CONTENT_STYLES = `
  .pdf-page-render {
    font-family: 'tablet-gothic-wide', ui-sans-serif, system-ui,
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    line-height: 1.75;
    color: #18181b;
  }

  .pdf-page-render h1 {
    font-family: 'tablet-gothic-narrow', system-ui, sans-serif;
    font-size: 28px;
    font-weight: 700;
    margin-top: 1.5em;
    margin-bottom: 0.75em;
    line-height: 1.2;
    clear: both;
  }

  .pdf-page-render h1.document-title {
    font-size: 36px;
    margin-top: 2em;
    margin-bottom: 0.5em;
  }

  .pdf-page-render h2 {
    font-family: 'tablet-gothic-narrow', system-ui, sans-serif;
    font-size: 24px;
    font-weight: 600;
    margin-top: 1.25em;
    margin-bottom: 0.5em;
    line-height: 1.3;
    clear: both;
  }

  .pdf-page-render h3 {
    font-family: 'tablet-gothic-narrow', system-ui, sans-serif;
    font-size: 20px;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
    line-height: 1.4;
    clear: both;
  }

  .pdf-page-render h4 {
    font-family: 'tablet-gothic-narrow', system-ui, sans-serif;
    font-size: 18px;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
    clear: both;
  }

  /* Remove top margin from first heading in content */
  .pdf-page-render h1:first-child,
  .pdf-page-render h2:first-child,
  .pdf-page-render h3:first-child,
  .pdf-page-render h4:first-child {
    margin-top: 0;
  }

  .pdf-page-render p {
    margin: 1em 0;
    line-height: 1.75;
    min-height: 1.75em; /* Ensure empty paragraphs are visible */
  }

  .pdf-page-render ul,
  .pdf-page-render ol {
    padding-left: 1.5em;
    margin: 1em 0;
  }

  .pdf-page-render ul,
  .pdf-page-render ol {
    list-style: none;
  }

  .pdf-page-render li {
    margin: 0.5em 0;
  }

  /* Explicit markers (html2canvas ignores ::marker, draws its own – we use spans instead) */
  .pdf-page-render .pdf-list-marker {
    display: inline;
    margin-right: 0.35em;
    font-family: system-ui, sans-serif;
    font-size: 1em;
    vertical-align: 3px;
  }

  .pdf-page-render a {
    color: #075985;
    text-decoration: underline;
  }

  .pdf-page-render img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 0.5em 0;
  }

  .pdf-page-render img.img-align-left {
    float: left;
    margin: 0.5em 1.5em 1em 0;
    max-width: 50%;
  }

  .pdf-page-render img.img-align-right {
    float: right;
    margin: 0.5em 0 1em 1.5em;
    max-width: 50%;
  }

  .pdf-page-render img.img-align-center {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .pdf-page-render table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    margin: 1em 0;
    table-layout: fixed;
  }

  .pdf-page-render th,
  .pdf-page-render td {
    border: 1px solid #d1d5db;
    padding: 0.75em;
    vertical-align: top;
    text-align: left;
  }

  .pdf-page-render th {
    background-color: #f3f4f6;
    font-weight: 600;
  }

  .pdf-page-render tr {
    page-break-inside: avoid;
  }

  .pdf-page-render blockquote {
    border-left: 4px solid #d1d5db;
    margin: 1em 0;
    padding-left: 1em;
    color: #6b7280;
    font-style: italic;
  }

  .pdf-page-render strong,
  .pdf-page-render b { font-weight: 600; }

  .pdf-page-render em,
  .pdf-page-render i { font-style: italic; }

  .pdf-page-render u { text-decoration: underline; }

  .pdf-page-render code {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }

  .pdf-page-render mark {
    background-color: oklch(0.852 0.199 91.936 / 0.3);
    color: inherit;
    padding: 0.1em 0;
  }
`

// ============================================================================
// PDF header / footer configuration
// ============================================================================

/** Logo path served from the public directory */
const PDF_LOGO_PATH = '/logo-pdf-storyon.png'

/** Footer text shown on every PDF page */
const PDF_FOOTER_TEXT = 'StoryON přináší Paměť národa'

// ============================================================================
// Off-screen page rendering
// ============================================================================

interface RenderedPage {
  element: HTMLElement
}

interface PageLayoutOptions {
  /** Additional top margin (px) to reserve space for header */
  extraTopMargin?: number
}

/** Inject PDF content styles into <head>; returns a remove function. */
function injectPdfStyles(): () => void {
  const styleEl = document.createElement('style')
  styleEl.setAttribute('data-pdf-styles', 'true')
  styleEl.textContent = PDF_CONTENT_STYLES
  document.head.appendChild(styleEl)
  return () => {
    document.head.removeChild(styleEl)
  }
}

/**
 * Fetch an image from a URL and return it as a base64 data URL.
 * Returns null if the fetch fails (header will be omitted gracefully).
 */
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Transforms native ul/ol list markers into explicit span elements.
 * html2canvas-pro draws its own list markers (ignoring ::marker) and positions
 * them incorrectly. By using list-style:none and explicit spans, we get full
 * control over marker positioning via CSS.
 */
function transformListsForPdf(container: HTMLElement): void {
  container.querySelectorAll('ul, ol').forEach((list) => {
    const ol = list as HTMLOListElement
    ;(list as HTMLElement).style.listStyle = 'none'
    const isOl = list.tagName === 'OL'
    const start = isOl ? Math.max(1, parseInt(ol.getAttribute('start') || '1', 10)) : 0
    const items = Array.from(list.children).filter((el) => el.tagName === 'LI')
    items.forEach((li, index) => {
      const marker = document.createElement('span')
      marker.className = 'pdf-list-marker'
      if (isOl) {
        marker.textContent = `${start + index}.`
      } else {
        marker.textContent = '•'
      }
      li.insertBefore(marker, li.firstChild)
    })
  })
}

/**
 * Creates an off-screen container, splits HTML content into page-sized
 * chunks by measuring block heights, and returns a page-sized DOM element
 * for each page (ready for html2canvas capture).
 *
 * Each page element has the class "pdf-page-render" so the injected
 * PDF_CONTENT_STYLES apply to it.
 *
 * @param options.extraTopMargin - Additional top margin to reserve for header
 */
function renderPagesOffScreen(
  htmlContent: string,
  options?: PageLayoutOptions,
): RenderedPage[] {
  const extraTop = options?.extraTopMargin ?? 0
  const effectiveTopMargin = MARGIN_TOP + extraTop
  const effectiveUsableHeight = PAGE_HEIGHT - effectiveTopMargin - MARGIN_BOTTOM

  // Create measurement container matching usable content width
  const container = document.createElement('div')
  container.className = 'pdf-page-render'
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = `${USABLE_WIDTH}px`
  container.innerHTML = htmlContent

  // Remove any page break decorations from cloned content
  container
    .querySelectorAll('[data-pagination-break], .plate-page-break')
    .forEach((el) => el.remove())

  // Replace native list markers with explicit spans (html2canvas ignores ::marker)
  transformListsForPdf(container)

  document.body.appendChild(container)

  const children = Array.from(container.children) as HTMLElement[]
  const pages: RenderedPage[] = []
  let currentPageElements: HTMLElement[] = []
  let currentHeight = 0

  const flushPage = () => {
    if (currentPageElements.length === 0) return

    const pageEl = document.createElement('div')
    pageEl.className = 'pdf-page-render'
    pageEl.style.position = 'relative'
    pageEl.style.width = `${PAGE_WIDTH}px`
    pageEl.style.height = `${PAGE_HEIGHT}px`
    pageEl.style.padding = `${effectiveTopMargin}px ${MARGIN_RIGHT}px ${MARGIN_BOTTOM}px ${MARGIN_LEFT}px`
    pageEl.style.boxSizing = 'border-box'
    pageEl.style.background = '#fff'
    pageEl.style.overflow = 'hidden'

    for (const el of currentPageElements) {
      pageEl.appendChild(el.cloneNode(true))
    }

    pages.push({ element: pageEl })
    currentPageElements = []
    currentHeight = 0
  }

  for (const child of children) {
    const style = window.getComputedStyle(child)
    const marginTop = parseFloat(style.marginTop) || 0
    const marginBottom = parseFloat(style.marginBottom) || 0
    const height =
      child.getBoundingClientRect().height + marginTop + marginBottom

    if (currentHeight > 0 && currentHeight + height > effectiveUsableHeight) {
      flushPage()
    }

    currentPageElements.push(child)
    currentHeight += height
  }

  flushPage()

  document.body.removeChild(container)

  // Ensure at least one blank page
  if (pages.length === 0) {
    const blankPage = document.createElement('div')
    blankPage.className = 'pdf-page-render'
    blankPage.style.position = 'relative'
    blankPage.style.width = `${PAGE_WIDTH}px`
    blankPage.style.height = `${PAGE_HEIGHT}px`
    blankPage.style.background = '#fff'
    pages.push({ element: blankPage })
  }

  return pages
}

/**
 * Injects header (logo) and footer (text + page number) into each page element.
 * These are absolutely positioned within the page margins so they don't
 * overlap with content.
 */
function injectHeaderFooter(
  pages: RenderedPage[],
  logoDataUrl: string | null,
): void {
  const totalPages = pages.length

  for (let i = 0; i < pages.length; i++) {
    const { element } = pages[i]

    // --- Header: logo at top-right ---
    if (logoDataUrl) {
      const header = document.createElement('div')
      header.style.cssText = `
        position: absolute;
        top: 18px;
        left: ${MARGIN_LEFT}px;
        right: ${MARGIN_RIGHT}px;
        height: 28px;
        line-height: 28px;
        text-align: right;
      `
      const logo = document.createElement('img')
      logo.src = logoDataUrl
      logo.style.cssText = 'height: 22px; width: auto; display: inline-block;'
      header.appendChild(logo)
      element.appendChild(header)
    }

    // --- Footer: text on left, page number on right ---
    const footer = document.createElement('div')
    footer.style.cssText = `
      position: absolute;
      bottom: 28px;
      left: ${MARGIN_LEFT}px;
      right: ${MARGIN_RIGHT}px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'tablet-gothic-wide', ui-sans-serif, system-ui, -apple-system,
        BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      color: #9ca3af;
      line-height: 1;
    `

    const footerText = document.createElement('span')
    footerText.textContent = PDF_FOOTER_TEXT
    footer.appendChild(footerText)

    const pageNum = document.createElement('span')
    pageNum.textContent = `${i + 1}/${totalPages}`
    footer.appendChild(pageNum)

    element.appendChild(footer)
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Exports content as a PDF file using html2canvas-pro + pdf-lib.
 *
 * Each page includes:
 * - Header: StoryON logo at top-left
 * - Content: the material HTML, paginated to fit A4
 * - Footer: "StoryON přináší Paměť národa" on left, page number on right
 *
 * Downloads the PDF directly (no print dialog).
 *
 * @param title - Document title (used for filename)
 * @param content - HTML content to export
 */
export async function exportToPDF(
  title: string,
  content: string,
): Promise<void> {
  if (!content || content.trim().length === 0) {
    throw new Error('Obsah materiálu je prázdný')
  }

  // Strip legacy page break comments
  const processedContent = content.replace(
    /<!--\s*pagebreak\s*-->/gi,
    '<div class="page-break-after"></div>',
  )

  // Dynamic imports + fetch logo in parallel
  const [html2canvasModule, PDFLib, logoDataUrl] = await Promise.all([
    import('html2canvas-pro'),
    import('pdf-lib'),
    fetchImageAsDataUrl(PDF_LOGO_PATH),
  ])
  const html2canvas = html2canvasModule.default

  // Inject PDF content styles
  const removePdfStyles = injectPdfStyles()

  try {
    // Render pages – header (18px top, 28px height) fits within MARGIN_TOP (60px)
    const pages = renderPagesOffScreen(processedContent)
    const filename = sanitizeFilename(title) || 'document'

    // Inject header (logo) and footer (text + pagination) into each page
    injectHeaderFooter(pages, logoDataUrl)

    // Wait for fonts to load before rendering
    await document.fonts.ready

    const pdfDoc = await PDFLib.PDFDocument.create()

    // Render each page with html2canvas-pro at 2x resolution
    for (let i = 0; i < pages.length; i++) {
      const { element } = pages[i]

      // Temporarily add to DOM for rendering
      document.body.appendChild(element)

      // Force layout calculation
      void element.offsetHeight

      // Allow async rendering to complete
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Capture page as high-resolution image
      const canvas = await html2canvas(element, {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        scale: 2, // 2x resolution – good balance of speed and quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      })

      // Remove from DOM
      document.body.removeChild(element)

      // Add page image to PDF
      const pngData = canvas.toDataURL('image/png')
      const pngImage = await pdfDoc.embedPng(pngData)

      // A4 page dimensions in points (72 DPI)
      const pageWidthPt = (PAGE_WIDTH / 96) * 72
      const pageHeightPt = (PAGE_HEIGHT / 96) * 72
      const page = pdfDoc.addPage([pageWidthPt, pageHeightPt])

      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pageWidthPt,
        height: pageHeightPt,
      })
    }

    // Save and download PDF directly
    const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true })
    const link = document.createElement('a')
    link.href = pdfBase64
    link.download = `${filename}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()

    logger.info('PDF export completed successfully')
  } finally {
    // Always clean up injected styles
    removePdfStyles()
  }
}

/**
 * Opens the browser print dialog for the content.
 * Uses a complete HTML document with print-optimized CSS.
 *
 * @param title - Document title
 * @param content - HTML content to print
 */
export async function printContent(
  title: string,
  content: string,
): Promise<void> {
  try {
    const processedContent = content.replace(
      /<!--\s*pagebreak\s*-->/gi,
      '<div class="page-break-after"></div>',
    )

    const printHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  ${processedContent}
</body>
</html>`

    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      throw new Error('Popup blocked')
    }

    printWindow.document.write(printHtml)
    printWindow.document.close()
    printWindow.print()
  } catch (error) {
    logger.error('Error opening print dialog', error)
    throw error
  }
}

// ============================================================================
// Helpers
// ============================================================================

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(
      /[^a-z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s-]/gi,
      '',
    )
    .replace(/\s+/g, '-')
    .substring(0, 100)
}
