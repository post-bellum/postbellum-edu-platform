/**
 * PDF Export Utilities
 *
 * Uses html2pdf.js to generate PDF documents from HTML content.
 * Handles page breaks, A4 formatting, and print-optimized styling.
 */

import { logger } from '@/lib/logger'

// html2pdf.js type definitions
interface Html2PdfOptions {
  margin?: number | [number, number, number, number]
  filename?: string
  image?: { type: 'jpeg' | 'png' | 'webp'; quality: number }
  html2canvas?: {
    scale: number
    useCORS: boolean
    letterRendering: boolean
    allowTaint: boolean
  }
  jsPDF?: {
    unit: string
    format: string | [number, number]
    orientation: 'portrait' | 'landscape'
  }
  pagebreak?: {
    mode: string | string[]
    before?: string | string[]
    after?: string | string[]
    avoid?: string | string[]
  }
}

/**
 * Dynamically imports html2pdf.js to avoid SSR issues
 */
async function getHtml2Pdf() {
  try {
    // Dynamic import to avoid SSR issues
    const html2pdf = await import('html2pdf.js')
    return html2pdf.default || html2pdf
  } catch (error) {
    logger.error('Failed to load html2pdf.js', error)
    throw new Error('PDF export library not available')
  }
}

/**
 * Converts page break comments to CSS page breaks for PDF/print
 */
function processPageBreaks(content: string): string {
  return content
    .replace(/<!--\s*pagebreak\s*-->/gi, '<div class="page-break-after"></div>')
    .replace(/<div[^>]*class="page-break-after"[^>]*><\/div>/gi, '<div class="page-break-after"></div>')
}

/**
 * Creates a print-optimized HTML document from content
 */
function createPrintView(title: string, content: string): string {
  const processedContent = processPageBreaks(content)

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'tablet-gothic-wide', ui-sans-serif, system-ui,
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #18181B;
      margin: 0;
      padding: 0;
      background: white;
    }

    /* Typography */
    h1, h2, h3, h4 {
      page-break-after: avoid;
      break-after: avoid;
      clear: both;
    }

    h1 {
      font-size: 22pt;
      font-weight: 700;
      margin: 1.5em 0 0.75em;
      line-height: 1.2;
    }

    h2 {
      font-size: 18pt;
      font-weight: 600;
      margin: 1.25em 0 0.5em;
      line-height: 1.3;
    }

    h3 {
      font-size: 15pt;
      font-weight: 600;
      margin: 1em 0 0.5em;
      line-height: 1.4;
    }

    h4 {
      font-size: 13pt;
      font-weight: 600;
      margin: 1em 0 0.5em;
    }

    p {
      margin: 0.75em 0;
      orphans: 3;
      widows: 3;
    }

    /* Lists */
    ul, ol {
      margin: 0.75em 0;
      padding-left: 1.5em;
    }

    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }

    li {
      margin: 0.25em 0;
      page-break-inside: avoid;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      page-break-inside: avoid;
      display: block;
      margin: 0.5em auto;
    }

    img.img-align-left {
      float: left;
      margin: 0.5em 1em 1em 0;
      max-width: 45%;
    }

    img.img-align-right {
      float: right;
      margin: 0.5em 0 1em 1em;
      max-width: 45%;
    }

    img.img-align-center {
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    /* Tables */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #d1d5db;
      padding: 0.5em 0.75em;
      page-break-inside: avoid;
    }

    th {
      background-color: #f3f4f6;
      font-weight: 600;
    }

    /* Other elements */
    blockquote {
      border-left: 4px solid #d1d5db;
      margin: 1em 0;
      padding-left: 1em;
      color: #6b7280;
      page-break-inside: avoid;
    }

    a {
      color: #075985;
      text-decoration: underline;
    }

    code {
      background-color: #f3f4f6;
      padding: 0.15em 0.35em;
      border-radius: 3px;
      font-size: 0.9em;
    }

    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 1.5em 0;
      page-break-after: avoid;
    }

    strong, b { font-weight: 600; }
    em, i { font-style: italic; }
    u { text-decoration: underline; }

    /* Page breaks */
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
  </style>
</head>
<body>
  ${processedContent}
</body>
</html>`
}

/**
 * Exports content as a PDF using html2pdf.js
 */
export async function exportToPDF(title: string, content: string): Promise<void> {
  try {
    const html2pdf = await getHtml2Pdf()
    
    if (!content || content.trim().length === 0) {
      throw new Error('Obsah materiálu je prázdný')
    }
    
    const processedContent = processPageBreaks(content)
    const filename = sanitizeFilename(title) || 'document'
    
    // Create complete HTML document with styles matching the editor
    const htmlDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }

          body {
            font-family: Arial, sans-serif !important;
            font-size: 16px !important;
            line-height: 1.75 !important;
            color: #18181b !important;
            margin: 0;
            padding: 0;
            background: white;
          }

          /* Headings - using web-safe fonts for PDF compatibility */
          h1 {
            font-family: Arial, sans-serif !important;
            font-size: 28px !important;
            font-weight: 700 !important;
            margin: 1.5em 0 0.75em !important;
            line-height: 1.2 !important;
            page-break-after: avoid;
            clear: both;
          }

          h2 {
            font-family: Arial, sans-serif !important;
            font-size: 24px !important;
            font-weight: 600 !important;
            margin: 1.25em 0 0.5em !important;
            line-height: 1.3 !important;
            page-break-after: avoid;
            clear: both;
          }

          h3 {
            font-family: Arial, sans-serif !important;
            font-size: 20px !important;
            font-weight: 600 !important;
            margin: 1em 0 0.5em !important;
            line-height: 1.4 !important;
            page-break-after: avoid;
            clear: both;
          }

          h4 {
            font-family: Arial, sans-serif !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            margin: 1em 0 0.5em !important;
            page-break-after: avoid;
            clear: both;
          }

          /* Paragraphs */
          p {
            margin: 1em 0 !important;
            line-height: 1.75 !important;
            orphans: 3;
            widows: 3;
            font-size: 16px !important;
          }

          /* Lists */
          ul, ol {
            padding-left: 1.5em;
            margin: 1em 0;
          }

          ul {
            list-style-type: disc;
          }

          ol {
            list-style-type: decimal;
          }

          li {
            margin: 0.5em 0;
            page-break-inside: avoid;
          }

          /* Links */
          a {
            color: #075985;
            text-decoration: underline;
          }

          /* Images */
          img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 0.5em 0;
            page-break-inside: avoid;
            display: block;
            margin-left: auto;
            margin-right: auto;
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

          /* Tables */
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            page-break-inside: avoid;
          }

          th, td {
            border: 1px solid #d1d5db;
            padding: 0.75em;
            page-break-inside: avoid;
          }

          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }

          /* Blockquotes */
          blockquote {
            border-left: 4px solid #d1d5db;
            margin: 1em 0;
            padding-left: 1em;
            color: #6b7280;
            page-break-inside: avoid;
          }

          /* Text formatting */
          strong, b {
            font-weight: 600;
          }

          em, i {
            font-style: italic;
          }

          u {
            text-decoration: underline;
          }

          code {
            background-color: #f3f4f6;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-size: 0.9em;
          }

          hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 1.5em 0;
            page-break-after: avoid;
          }

          /* Page breaks */
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
        </style>
      </head>
      <body>
        ${processedContent}
      </body>
      </html>
    `

    const options: Html2PdfOptions = {
      margin: [15, 15, 15, 15],
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.85 },
      html2canvas: {
        scale: 1,
        useCORS: true,
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    }

    try {
      // Use html2pdf with HTML string instead of DOM element
      await html2pdf().set(options).from(htmlDocument).save()
      logger.info('PDF export completed successfully')
    } catch (pdfError) {
      logger.error('html2pdf.js failed:', pdfError)
      // Fallback: open print dialog
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlDocument)
        printWindow.document.close()
        printWindow.print()
      } else {
        throw new Error('Popup blocked and PDF generation failed')
      }
    }
  } catch (error) {
    logger.error('Error in PDF export', error)
    throw error
  }
}

/**
 * Opens the print dialog for the content
 */
export async function printContent(title: string, content: string): Promise<void> {
  try {
    const printHtml = createPrintView(title, content)
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

// Helper functions
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
    .replace(/[^a-z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s-]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 100)
}