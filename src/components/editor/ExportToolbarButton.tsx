'use client'

import * as React from 'react'
import { useEditorRef } from 'platejs/react'
import { createSlateEditor } from 'platejs'
import { serializeHtml } from 'platejs/static'
import {
  ArrowDownToLine,
  FileText,
  FileImage,
  FileCode,
} from 'lucide-react'

import { BaseEditorKit } from './editor-base-kit'
import { EditorStatic } from '@/components/ui/plate/editor-static'
import {
  ToolbarDropdownItem,
} from './plate-ui/toolbar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

// ============================================================================
// Helpers
// ============================================================================

async function downloadFile(url: string, filename: string) {
  const response = await fetch(url)
  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(blobUrl)
}

function sanitizeFilename(filename: string): string {
  return (
    filename
      .replace(
        /[^a-z0-9áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s-]/gi,
        '',
      )
      .replace(/\s+/g, '-')
      .substring(0, 100) || 'document'
  )
}

// ============================================================================
// ExportToolbarButton
// ============================================================================

interface ExportToolbarButtonProps {
  /** Document title used for the exported filename */
  title?: string
}

export function ExportToolbarButton({ title = 'document' }: ExportToolbarButtonProps) {
  const editor = useEditorRef()
  const [isExporting, setIsExporting] = React.useState(false)

  const filename = sanitizeFilename(title)

  /**
   * Captures the editor DOM as a canvas using html2canvas-pro.
   * This is the Plate approach – it captures the live editor DOM directly.
   */
  const getCanvas = React.useCallback(async () => {
    const { default: html2canvas } = await import('html2canvas-pro')

    const editorDomNode = editor.api.toDOMNode(editor)
    if (!editorDomNode) {
      throw new Error('Could not find editor DOM node')
    }

    const canvas = await html2canvas(editorDomNode, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (document: Document) => {
        const editorElement = document.querySelector(
          '[contenteditable="true"]',
        )
        if (editorElement) {
          // Apply system font fallback to ensure text renders correctly
          Array.from(editorElement.querySelectorAll('*')).forEach(
            (element) => {
              const existingStyle = element.getAttribute('style') || ''
              element.setAttribute(
                'style',
                `${existingStyle}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important`,
              )
            },
          )
        }
      },
    })

    return canvas
  }, [editor])

  /**
   * Export to PDF using html2canvas-pro + pdf-lib.
   * Captures the editor as a high-resolution image and embeds it into a PDF.
   */
  const exportToPdf = React.useCallback(async () => {
    setIsExporting(true)
    try {
      const canvas = await getCanvas()

      const PDFLib = await import('pdf-lib')
      const pdfDoc = await PDFLib.PDFDocument.create()
      const page = pdfDoc.addPage([canvas.width, canvas.height])
      const imageEmbed = await pdfDoc.embedPng(canvas.toDataURL('image/png'))
      const { height, width } = imageEmbed.scale(1)
      page.drawImage(imageEmbed, {
        height,
        width,
        x: 0,
        y: 0,
      })
      const pdfBase64 = await pdfDoc.saveAsBase64({ dataUri: true })

      await downloadFile(pdfBase64, `${filename}.pdf`)
      logger.info('PDF export completed successfully')
    } catch (error) {
      logger.error('PDF export failed', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [getCanvas, filename])

  /**
   * Export to PNG image using html2canvas-pro.
   */
  const exportToImage = React.useCallback(async () => {
    setIsExporting(true)
    try {
      const canvas = await getCanvas()
      await downloadFile(canvas.toDataURL('image/png'), `${filename}.png`)
      logger.info('Image export completed successfully')
    } catch (error) {
      logger.error('Image export failed', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [getCanvas, filename])

  /**
   * Export to HTML using Plate's serializeHtml with static components.
   */
  const exportToHtml = React.useCallback(async () => {
    setIsExporting(true)
    try {
      const editorStatic = createSlateEditor({
        plugins: BaseEditorKit,
        value: editor.children,
      })

      const editorHtml = await serializeHtml(editorStatic, {
        editorComponent: EditorStatic,
        props: {
          style: { padding: '0 calc(50% - 350px)', paddingBottom: '' },
        },
      })

      const html = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: "JetBrains Mono", "Fira Code", monospace;
    }
    body {
      font-family: var(--font-sans);
      font-size: 16px;
      line-height: 1.75;
      color: #18181b;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #fff;
    }
    h1, h2, h3, h4 { font-weight: 600; line-height: 1.3; }
    h1 { font-size: 2rem; margin-top: 1.5em; }
    h2 { font-size: 1.5rem; margin-top: 1.25em; }
    h3 { font-size: 1.25rem; margin-top: 1em; }
    h4 { font-size: 1.125rem; margin-top: 0.75em; }
    a { color: #075985; text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d1d5db; padding: 0.75em; text-align: left; }
    th { background-color: #f3f4f6; font-weight: 600; }
    blockquote { border-left: 4px solid #d1d5db; margin: 1em 0; padding-left: 1em; color: #6b7280; }
    code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
    strong { font-weight: 600; }
  </style>
</head>
<body>
  ${editorHtml}
</body>
</html>`

      const url = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
      await downloadFile(url, `${filename}.html`)
      logger.info('HTML export completed successfully')
    } catch (error) {
      logger.error('HTML export failed', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [editor.children, filename, title])

  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleExport = (fn: () => Promise<void>) => async () => {
    setOpen(false)
    await fn()
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
              'inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium transition-colors',
              'hover:bg-gray-100 hover:text-gray-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
              'disabled:pointer-events-none disabled:opacity-50',
              open && 'bg-gray-100 text-gray-900',
            )}
            disabled={isExporting}
          >
            <ArrowDownToLine className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Export</TooltipContent>
      </Tooltip>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          <ToolbarDropdownItem onClick={handleExport(exportToHtml)} disabled={isExporting}>
            <FileCode className="h-4 w-4" />
            Exportovat HTML
          </ToolbarDropdownItem>
          <ToolbarDropdownItem onClick={handleExport(exportToPdf)} disabled={isExporting}>
            <FileText className="h-4 w-4" />
            Exportovat PDF
          </ToolbarDropdownItem>
          <ToolbarDropdownItem onClick={handleExport(exportToImage)} disabled={isExporting}>
            <FileImage className="h-4 w-4" />
            Exportovat obrázek
          </ToolbarDropdownItem>
        </div>
      )}
    </div>
  )
}
