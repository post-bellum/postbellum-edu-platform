/**
 * PDF Export and Print Utilities
 * Handles PDF generation and printing for TinyMCE content with proper
 * page break handling and image preloading.
 */

import { logger } from '@/lib/logger'

// Type for html2pdf.js library
type Html2Pdf = {
  (): {
    set: (options: unknown) => {
      from: (element: HTMLElement) => {
        save: () => Promise<void>
      }
    }
  }
}

// Dynamically import html2pdf.js to avoid SSR issues
let html2pdf: Html2Pdf | null = null

async function getHtml2Pdf(): Promise<Html2Pdf | null> {
  if (typeof window === 'undefined') {
    return null
  }
  
  if (!html2pdf) {
    try {
      const html2pdfModule = await import('html2pdf.js')
      html2pdf = (html2pdfModule.default || html2pdfModule) as Html2Pdf
    } catch (error) {
      logger.warn('Failed to load html2pdf.js', error)
      return null
    }
  }
  
  return html2pdf
}

/**
 * Converts TinyMCE page break comments to CSS page breaks for PDF/print
 * @param html - HTML content with <!-- pagebreak --> comments
 * @returns HTML with page breaks converted to CSS
 */
export function convertPageBreaks(html: string): string {
  // Replace <!-- pagebreak --> comments with div elements that have page-break-after
  // Add both CSS and class for html2pdf.js compatibility
  return html.replace(
    /<!--\s*pagebreak\s*-->/gi,
    '<div class="page-break-after" style="page-break-after: always; break-after: page; height: 0; margin: 0; padding: 0;"></div>'
  )
}

/**
 * Preloads all images in HTML content and converts to data URLs if needed
 * @param html - HTML content containing img tags
 * @returns Promise that resolves with HTML where images are preloaded
 */
export async function preloadImages(html: string): Promise<string> {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const images = tempDiv.querySelectorAll('img')
  const imagePromises: Promise<void>[] = []

  images.forEach((img) => {
    const promise = new Promise<void>((resolve) => {
      // Skip if image has no src
      if (!img.src) {
        resolve()
        return
      }

      // If image is already loaded, resolve immediately
      if (img.complete && img.naturalWidth > 0) {
        resolve()
        return
      }

      // Handle CORS issues by converting to data URL if possible
      const handleImageLoad = () => {
        // Try to convert to data URL if CORS allows (optional optimization)
        // Most modern browsers handle CORS for Supabase public URLs, so this is just a fallback
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (ctx && img.naturalWidth > 0 && img.naturalHeight > 0) {
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            ctx.drawImage(img, 0, 0)
            
            // Convert to data URL
            const dataUrl = canvas.toDataURL('image/png')
            img.src = dataUrl
          }
        } catch (error) {
          // If conversion fails, keep original src
          // This is fine - browsers can print external images if CORS allows
          logger.debug('Could not convert image to data URL (keeping original)', error)
        }
        resolve()
      }

      img.onload = handleImageLoad
      img.onerror = () => {
        // If image fails to load, keep original src and continue
        logger.debug('Image failed to load', { src: img.src })
        resolve()
      }
    })

    imagePromises.push(promise)
  })

  // Wait for all images to load
  await Promise.all(imagePromises)

  return tempDiv.innerHTML
}

/**
 * Creates a print-optimized HTML document from content
 * @param title - Document title
 * @param content - HTML content
 * @returns Complete HTML document string
 */
export function createPrintView(title: string, content: string): string {
  const htmlWithPageBreaks = convertPageBreaks(content)
  
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
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #18181B;
      margin: 0;
      padding: 0;
      background: white;
    }
    
    .print-header {
      margin-bottom: 2em;
      padding-bottom: 1em;
      border-bottom: 2px solid #d1d5db;
    }
    
    .print-title {
      font-size: 24pt;
      font-weight: 700;
      margin: 0 0 0.5em 0;
      color: #18181B;
    }
    
    .print-content {
      color: #18181B;
      font-size: 10pt;
      line-height: 1.7;
    }
    
    .print-content h1 {
      font-size: 20pt;
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.75em;
      line-height: 1.2;
      page-break-after: avoid;
    }
    
    .print-content h2 {
      font-size: 16pt;
      font-weight: 600;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      line-height: 1.3;
      page-break-after: avoid;
    }
    
    .print-content h3 {
      font-size: 14pt;
      font-weight: 600;
      margin-top: 1em;
      margin-bottom: 0.5em;
      line-height: 1.4;
      page-break-after: avoid;
    }
    
    .print-content h4 {
      font-size: 12pt;
      font-weight: 600;
      margin-top: 1em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
    }
    
    .print-content p {
      margin: 1em 0;
      line-height: 1.7;
      orphans: 3;
      widows: 3;
    }
    
    .print-content ul,
    .print-content ol {
      margin: 1em 0;
      padding-left: 1.5em;
      page-break-inside: avoid;
    }
    
    .print-content li {
      margin: 0.5em 0;
      page-break-inside: avoid;
    }
    
    .print-content img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      page-break-inside: avoid;
      page-break-after: avoid;
      /* Allow inline images by default - display inline-block to preserve side-by-side layout */
      display: inline-block;
      vertical-align: top;
      margin: 0.5em 0.5em 0.5em 0;
    }
    
    /* Images that are the only child of a paragraph - display as block */
    .print-content p > img:only-child {
      display: block;
      margin: 1em auto;
    }
    
    /* Image alignment classes */
    .print-content img.img-align-left {
      float: left;
      margin: 0.5em 1.5em 1em 0;
      max-width: 50%;
    }
    
    .print-content img.img-align-right {
      float: right;
      margin: 0.5em 0 1em 1.5em;
      max-width: 50%;
    }
    
    .print-content img.img-align-center {
      display: block;
      margin-left: auto;
      margin-right: auto;
      float: none;
    }
    
    .print-content img.img-full-width {
      width: 100%;
      max-width: 100%;
      float: none;
      display: block;
    }
    
    /* Image style classes */
    .print-content img.img-rounded {
      border-radius: 16px;
    }
    
    .print-content img.img-bordered {
      border: 3px solid #e5e7eb;
      border-radius: 8px;
    }
    
    .print-content img.img-shadow {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }
    
    /* Figure/caption styling */
    .print-content figure.image {
      display: table;
      margin: 1.5em auto;
      max-width: 100%;
      page-break-inside: avoid;
    }
    
    .print-content figure.image img {
      display: block;
      margin: 0 auto;
    }
    
    .print-content figure.image figcaption {
      display: table-caption;
      caption-side: bottom;
      text-align: center;
      font-size: 10pt;
      color: #6b7280;
      padding: 8px 0;
      font-style: italic;
    }
    
    /* Clearfix - only applied to specific elements, not paragraphs (to allow text wrap around floated images) */
    .print-content .clearfix::after {
      content: "";
      display: table;
      clear: both;
    }
    
    /* Clear float after headings to prevent text from wrapping into next section */
    .print-content h1,
    .print-content h2,
    .print-content h3,
    .print-content h4,
    .print-content h5,
    .print-content h6 {
      clear: both;
    }
    
    .print-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    
    .print-content th,
    .print-content td {
      border: 1px solid #d1d5db;
      padding: 0.5em;
      page-break-inside: avoid;
    }
    
    .print-content th {
      background-color: #f3f4f6;
      font-weight: 600;
    }
    
    .print-content blockquote {
      border-left: 4px solid #d1d5db;
      margin: 1em 0;
      padding-left: 1em;
      color: #6b7280;
      page-break-inside: avoid;
    }
    
    .print-content code {
      background-color: #f3f4f6;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    .print-content pre {
      background-color: #f3f4f6;
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    
    /* Page break handling */
    div[style*="page-break-after"],
    .page-break-after {
      page-break-after: always !important;
      break-after: page !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    
    .no-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .print-header {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="print-content">
    ${htmlWithPageBreaks}
  </div>
</body>
</html>`
}

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

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
      // Create a temporary container element
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = createPrintView(title, contentWithImages)
      document.body.appendChild(tempDiv)
      
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
        
        // Generate and download PDF
        // html2pdf.js returns a promise-like object
        const pdfPromise = html2pdfLib().set(opt).from(tempDiv).save()
        await Promise.resolve(pdfPromise)
        
        // Clean up
        document.body.removeChild(tempDiv)
        return
      } catch (pdfError) {
        // Clean up on error
        if (tempDiv.parentNode) {
          document.body.removeChild(tempDiv)
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
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s-]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 100)
}

/**
 * Opens print dialog for content
 * @param title - Document title
 * @param content - HTML content
 */
export async function printContent(title: string, content: string): Promise<void> {
  try {
    // Preload images first
    const contentWithImages = await preloadImages(content)
    
    // Create print-optimized HTML
    const printHtml = createPrintView(title, contentWithImages)
    
    // Open in new window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.')
    }
    
    // Write HTML to window
    printWindow.document.write(printHtml)
    printWindow.document.close()
    
    // Wait for content to load
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
    
    // Trigger print dialog
    printWindow.print()
    
    // Don't auto-close for print (user may want to adjust settings)
  } catch (error) {
    logger.error('Error printing content', error)
    throw error
  }
}

