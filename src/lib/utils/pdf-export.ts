/**
 * PDF Export Utilities
 *
 * Uses html2canvas + jsPDF for page-by-page PDF rendering.
 * Ported from the richtexteditor library's pdfRenderer.ts / exportPdf.ts.
 *
 * Algorithm:
 * 1. Clones editor HTML content into an off-screen container
 * 2. Measures each top-level block element's height
 * 3. Splits blocks into page-sized groups
 * 4. Renders each page group as a properly sized DOM element
 * 5. Captures each page with html2canvas at 2x resolution
 * 6. Assembles all page images into a jsPDF document
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

const PAGE_WIDTH = PAGE_DIMS.width  // 794px - A4 width at 96 DPI
const PAGE_HEIGHT = PAGE_DIMS.height // 1123px - A4 height at 96 DPI
const MARGIN_TOP = PAGE_DIMS.margin.top // 60px
const MARGIN_BOTTOM = PAGE_DIMS.margin.bottom // 80px
const MARGIN_LEFT = PAGE_DIMS.margin.left // 60px
const MARGIN_RIGHT = PAGE_DIMS.margin.right // 60px
const USABLE_HEIGHT = USABLE_PAGE_HEIGHT // 983px
const USABLE_WIDTH = USABLE_PAGE_WIDTH // 674px

// A4 in mm: 210 x 297
const PAGE_WIDTH_MM = (PAGE_WIDTH / 96) * 25.4  // ~210mm
const PAGE_HEIGHT_MM = (PAGE_HEIGHT / 96) * 25.4 // ~297mm

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

  a {
    color: #075985;
    text-decoration: underline;
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

  .pdf-page-render ul { list-style-type: disc; }
  .pdf-page-render ol { list-style-type: decimal; }

  .pdf-page-render li {
    margin: 0.5em 0;
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
`

// ============================================================================
// Off-screen page rendering
// ============================================================================

interface RenderedPage {
  element: HTMLElement
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
 * Creates an off-screen container, splits HTML content into page-sized
 * chunks by measuring block heights, and returns a page-sized DOM element
 * for each page (ready for html2canvas capture).
 *
 * Each page element has the class "pdf-page-render" so the injected
 * PDF_CONTENT_STYLES apply to it.
 */
function renderPagesOffScreen(htmlContent: string): RenderedPage[] {
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

  document.body.appendChild(container)

  const children = Array.from(container.children) as HTMLElement[]
  const pages: RenderedPage[] = []
  let currentPageElements: HTMLElement[] = []
  let currentHeight = 0

  const flushPage = () => {
    if (currentPageElements.length === 0) return

    const pageEl = document.createElement('div')
    pageEl.className = 'pdf-page-render'
    pageEl.style.width = `${PAGE_WIDTH}px`
    pageEl.style.height = `${PAGE_HEIGHT}px`
    pageEl.style.padding = `${MARGIN_TOP}px ${MARGIN_RIGHT}px ${MARGIN_BOTTOM}px ${MARGIN_LEFT}px`
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

    if (currentHeight > 0 && currentHeight + height > USABLE_HEIGHT) {
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
    blankPage.style.width = `${PAGE_WIDTH}px`
    blankPage.style.height = `${PAGE_HEIGHT}px`
    blankPage.style.background = '#fff'
    pages.push({ element: blankPage })
  }

  return pages
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Exports content as a PDF file using html2canvas + jsPDF.
 *
 * Captures each page as a high-resolution image (4x scale) and adds
 * it to the PDF. This ensures the PDF matches the preview exactly.
 *
 * @param title - Document title (used for filename)
 * @param content - HTML content to export
 */
export async function exportToPDF(
  title: string,
  content: string,
): Promise<void> {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Obsah materiálu je prázdný')
    }

    // Strip legacy page break comments
    const processedContent = content.replace(
      /<!--\s*pagebreak\s*-->/gi,
      '<div class="page-break-after"></div>',
    )

    // Dynamic imports
    const [jsPDFModule, html2canvasModule] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ])
    const { jsPDF } = jsPDFModule
    const html2canvas = html2canvasModule.default

    // Inject PDF content styles
    const removePdfStyles = injectPdfStyles()

    try {
      const pages = renderPagesOffScreen(processedContent)
      const filename = sanitizeFilename(title) || 'document'

      // Wait for fonts to load before rendering
      await document.fonts.ready

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      // Render each page with html2canvas at 4x resolution
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
          scale: 4, // 4x resolution for crisp text
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: true,
          imageTimeout: 0,
        })

        // Remove from DOM
        document.body.removeChild(element)

        // Add page image to PDF
        const imgData = canvas.toDataURL('image/png')
        if (i > 0) {
          pdf.addPage('a4', 'portrait')
        }
        pdf.addImage(
          imgData,
          'PNG',
          0,
          0,
          PAGE_WIDTH_MM,
          PAGE_HEIGHT_MM,
          undefined,
          'FAST',
        )
      }

      pdf.save(`${filename}.pdf`)
      logger.info('PDF export completed successfully')
    } finally {
      // Always clean up injected styles
      removePdfStyles()
    }
  } catch (error) {
    logger.error('Error in PDF export', error)

    // Fallback: open print dialog
    try {
      await printContent(title, content)
    } catch {
      throw error
    }
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

<<<<<<< HEAD
/**
 * Exports content to PDF directly (downloads PDF file)
 * Uses html2pdf.js for direct PDF generation without print dialog
 * Falls back to print dialog if html2pdf.js is unavailable
 * @param title - Document title
 * @param content - HTML content
 */
export async function exportToPDF(title: string, content: string): Promise<void> {
  try {
    // Preload images first
    const contentWithImages = await preloadImages(content)
    
    // Try to use html2pdf.js for direct PDF download
    const html2pdfLib = await getHtml2Pdf()
    
    if (html2pdfLib) {
      // Use an iframe to completely isolate the print content from the main page
      // This prevents font-family changes from affecting the main page
      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.left = '-9999px'
      iframe.style.top = '-9999px'
      iframe.style.width = '210mm' // A4 width
      iframe.style.height = '297mm' // A4 height
      iframe.style.border = 'none'
      iframe.style.visibility = 'hidden'
      iframe.style.pointerEvents = 'none'
      iframe.style.zIndex = '-1'
      document.body.appendChild(iframe)
      
      // Wait for iframe to be ready
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve()
        iframe.src = 'about:blank'
        // Check if already loaded (some browsers load immediately)
        setTimeout(() => {
          if (iframe.contentDocument?.readyState === 'complete') {
            resolve()
          }
        }, 0)
      })
      
      // Write content to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        document.body.removeChild(iframe)
        throw new Error('Failed to access iframe document')
      }
      
      iframeDoc.open()
      iframeDoc.write(createPrintView(title, contentWithImages))
      iframeDoc.close()
      
      // Wait for iframe content to load
      await new Promise<void>((resolve) => {
        if (iframeDoc.readyState === 'complete') {
          resolve()
        } else {
          iframeDoc.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
          // Fallback timeout
          setTimeout(() => resolve(), 1000)
        }
      })
      
      // Get the body element from iframe for html2pdf
      const iframeBody = iframeDoc.body
      if (!iframeBody) {
        document.body.removeChild(iframe)
        throw new Error('Failed to access iframe body')
      }
      
      try {
        // Configure html2pdf.js options
        const opt = {
          margin: [20, 20, 20, 20],
          filename: `${sanitizeFilename(title)}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            windowWidth: iframeDoc.documentElement.scrollWidth,
            windowHeight: iframeDoc.documentElement.scrollHeight,
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
          },
          pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.page-break-before',
            after: '.page-break-after',
            avoid: ['img', '.no-break']
          }
        }
        
        // Generate and download PDF from iframe content
        // html2pdf.js returns a promise-like object
        const pdfPromise = html2pdfLib().set(opt).from(iframeBody).save()
        await Promise.resolve(pdfPromise)
        
        // Clean up
        document.body.removeChild(iframe)
        return
      } catch (pdfError) {
        // Clean up on error
        if (iframe.parentNode) {
          document.body.removeChild(iframe)
        }
        logger.debug('html2pdf.js failed, falling back to print dialog', pdfError)
        // Fall through to print dialog fallback
      }
    }
    
    // Fallback to print dialog if html2pdf.js is unavailable or fails
    const printHtml = createPrintView(title, contentWithImages)
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.')
    }
    
    printWindow.document.write(printHtml)
    printWindow.document.close()
    
    await new Promise<void>((resolve) => {
      printWindow.onload = () => {
        setTimeout(() => {
          resolve()
        }, 500)
      }
      
      if (printWindow.document.readyState === 'complete') {
        setTimeout(() => {
          resolve()
        }, 500)
      }
    })
    
    printWindow.print()
    
    setTimeout(() => {
      printWindow.close()
    }, 1000)
  } catch (error) {
    logger.error('Error exporting to PDF', error)
    throw error
  }
}

/**
 * Sanitizes filename for PDF download
 */
=======
>>>>>>> 2bfc3d4 (feat: Replace TinyMCE with Plate.js)
function sanitizeFilename(filename: string): string {
  return filename
    .replace(
      /[^a-z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s-]/gi,
      '',
    )
    .replace(/\s+/g, '-')
    .substring(0, 100)
}
