'use client'

import * as React from 'react'
import { Plate, usePlateEditor } from 'platejs/react'
import type { Value } from 'platejs'
import { cn } from '@/lib/utils'
import { uploadImageToStorage, STORAGE_LIMITS } from '@/lib/supabase/storage'
import { logger } from '@/lib/logger'
import { TooltipProvider } from '@/components/ui/Tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

import { editorPlugins } from './plate-plugins'
import { EditorContainer, Editor } from './plate-ui/editor'
import { EditorToolbar } from './EditorToolbar'
import './page-styles.css'

// Debounce delay for content sync
const CONTENT_SYNC_DELAY_MS = 800

interface PlateEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  /** Increment this to force the editor to reset with new content */
  resetKey?: number
}

/**
 * Block-based rich text editor using Plate.js.
 *
 * Features:
 * - Block drag & drop for content reorganization
 * - Simplified teacher-friendly toolbar (Czech localized)
 * - A4-styled page layout with visual page breaks
 * - HTML serialization for backward compatibility
 * - Image upload via paste/drag-drop to Supabase Storage
 *
 * @example
 * ```tsx
 * <PlateEditor
 *   content={html}
 *   onChange={setHtml}
 *   placeholder="Začněte psát..."
 * />
 * ```
 */
export function PlateEditor({
  content,
  onChange,
  placeholder = 'Začněte psát...',
  className,
  resetKey = 0,
}: PlateEditorProps) {
  // Wait for client-side hydration before rendering the editor.
  // Slate/Plate produces different DOM on server vs client which causes
  // hydration mismatches in Next.js.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  // "Image too large" info dialog
  const [imageTooLargeInfo, setImageTooLargeInfo] = React.useState<{ sizeMB: string; maxMB: string } | null>(null)

  // Refs for debounced content sync
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => { onChangeRef.current = onChange }, [onChange])
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncedRef = React.useRef<string>(content)

  // Parse initial HTML content once on mount
  const [initialValue] = React.useState(() => deserializeHtmlToPlate(content))

  const editor = usePlateEditor({
    plugins: editorPlugins,
    value: initialValue,
  })

  // Reset editor when resetKey changes
  const prevResetKeyRef = React.useRef(resetKey)
  React.useEffect(() => {
    if (resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetKey
      const newValue = deserializeHtmlToPlate(content)
      editor.tf.setValue(newValue)
    }
  }, [resetKey, content, editor])

  // Serialize editor content to HTML
  const serializeToHtml = React.useCallback((value: Value): string => {
    return serializePlateToHtml(value)
  }, [])

  // Debounced content sync
  const syncContent = React.useCallback((value: Value) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      const html = serializeToHtml(value)
      if (html !== lastSyncedRef.current) {
        lastSyncedRef.current = html
        onChangeRef.current(html)
      }
    }, CONTENT_SYNC_DELAY_MS)
  }, [serializeToHtml])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      // Final sync on unmount
      const html = serializeToHtml(editor.children as Value)
      if (html !== lastSyncedRef.current) {
        lastSyncedRef.current = html
        onChangeRef.current(html)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for "image too large" events from the ImagePlugin (drag-and-drop / paste)
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { sizeMB: string; maxMB: string }
      setImageTooLargeInfo(detail)
    }
    window.addEventListener('plate-image-too-large', handler)
    return () => window.removeEventListener('plate-image-too-large', handler)
  }, [])

  // Image upload handler (toolbar button)
  const handleInsertImage = React.useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Hard reject images > 2MB
      if (file.size > STORAGE_LIMITS.MAX_EDITOR_IMAGE_SIZE) {
        setImageTooLargeInfo({
          sizeMB: (file.size / 1024 / 1024).toFixed(1),
          maxMB: STORAGE_LIMITS.MAX_EDITOR_IMAGE_SIZE_DISPLAY,
        })
        return
      }

      try {
        const url = await uploadImageToStorage(file, 'lesson-materials', 'images')
        if (url) {
          editor.tf.insertNodes({
            type: 'img',
            url,
            align: 'center',
            children: [{ text: '' }],
          } as never)
          // Trigger immediate sync bypassing debounce to ensure parent has latest HTML
          setTimeout(() => {
            const html = serializeToHtml(editor.children as Value)
            if (html !== lastSyncedRef.current) {
              lastSyncedRef.current = html
              onChangeRef.current(html)
            }
          }, 100)
        }
      } catch (error) {
        logger.error('Error uploading image', error)
      }
    }
    input.click()
  }, [editor, serializeToHtml])

  if (!mounted) {
    return (
      <div
        className={cn(
          'plate-editor-wrapper',
          'border border-gray-200 rounded-xl bg-white overflow-hidden',
          'shadow-lg shadow-gray-200/50',
          'ring-1 ring-gray-100',
          'min-h-[300px] animate-pulse bg-gray-50',
          className
        )}
      />
    )
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          'plate-editor-wrapper',
          'border border-gray-200 rounded-xl bg-white overflow-hidden',
          'shadow-lg shadow-gray-200/50',
          'ring-1 ring-gray-100',
          className
        )}
      >
        <Plate
          editor={editor}
          onChange={({ value }) => syncContent(value)}
        >
          {/* Toolbar */}
          <EditorToolbar
            onInsertImage={handleInsertImage}
          />

          {/* Continuous editor - pagination only in preview/PDF */}
          <EditorContainer className="continuous-editor-container">
            <Editor
              placeholder={placeholder}
              className="continuous-editor-content"
            />
          </EditorContainer>
        </Plate>
      </div>

      {/* Image too large info dialog */}
      <Dialog open={!!imageTooLargeInfo} onOpenChange={() => setImageTooLargeInfo(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="mb-4">Obrázek je příliš velký</DialogTitle>
            <DialogDescription>
              Vybraný obrázek má {imageTooLargeInfo?.sizeMB ?? '?'}MB. Maximální povolená velikost obrázku je {imageTooLargeInfo?.maxMB ?? '2MB'}. Prosím zmenšete obrázek a zkuste to znovu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setImageTooLargeInfo(null)}>
              Rozumím
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

// ============================================================================
// HTML Serialization / Deserialization
// ============================================================================

/**
 * Deserialize HTML string into Plate value.
 * Handles TinyMCE page break comments and standard HTML.
 */
function deserializeHtmlToPlate(html: string): Value {
  if (!html || !html.trim()) {
    return [{ type: 'p', children: [{ text: '' }] }] as Value
  }

  // Strip legacy <!-- pagebreak --> comments (no longer used as editor nodes)
  const processedHtml = html.replace(/<!--\s*pagebreak\s*-->/gi, '')

  // Use browser DOM parser to convert HTML to Plate nodes
  if (typeof window === 'undefined') {
    return [{ type: 'p', children: [{ text: '' }] }] as Value
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<body>${processedHtml}</body>`, 'text/html')
  const body = doc.body

  const nodes = convertDomToPlate(body)
  if (nodes.length === 0) {
    return [{ type: 'p', children: [{ text: '' }] }] as Value
  }

  return nodes as Value
}

/**
 * Parse width from an HTML img/figure element for Plate image node.
 * Checks style.width (e.g. "400px", "50%") and width attribute.
 */
function parseImgWidth(el: HTMLElement): number | string | undefined {
  const styleWidth = el.style?.width
  if (styleWidth) {
    const trimmed = styleWidth.trim()
    if (trimmed.endsWith('px')) {
      const num = parseInt(trimmed, 10)
      return Number.isNaN(num) ? undefined : num
    }
    if (trimmed.endsWith('%')) return trimmed
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10)
      return Number.isNaN(num) ? undefined : num
    }
    return trimmed
  }
  const attrWidth = (el as HTMLImageElement).getAttribute?.('width')
  if (attrWidth) {
    const num = parseInt(attrWidth, 10)
    return Number.isNaN(num) ? undefined : num
  }
  return undefined
}

/**
 * Convert DOM nodes to Plate value recursively.
 */
function convertDomToPlate(parent: Node): Array<Record<string, unknown>> {
  const nodes: Array<Record<string, unknown>> = []

  parent.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text.trim()) {
        // Wrap orphan text in a paragraph
        nodes.push({ type: 'p', children: [{ text }] })
      }
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    // Skip legacy page break markers
    if (el.dataset.platePageBreak === 'true' || el.classList.contains('page-break-after')) {
      return
    }

    // Block elements
    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const align = el.style.textAlign || undefined
        // Check for document title (h1 with document-title class)
        const isTitle = tag === 'h1' && el.classList.contains('document-title')
        nodes.push({
          type: isTitle ? 'title' : (tag === 'h5' || tag === 'h6' ? 'h4' : tag),
          ...(align && { align }),
          children: convertInlineChildren(el),
        })
        return
      }
      case 'p': {
        const align = el.style.textAlign || undefined
        // Check if paragraph contains only an image
        const imgs = el.querySelectorAll('img')
        if (imgs.length === 1 && el.childNodes.length === 1) {
          const img = imgs[0] as HTMLImageElement
          const width = parseImgWidth(img)
          // Check for alignment class on the img element
          const className = img.className || ''
          let imgAlign: string | undefined = 'center' // default to center
          if (className.includes('img-align-left')) imgAlign = 'left'
          else if (className.includes('img-align-right')) imgAlign = 'right'
          else if (className.includes('img-align-center')) imgAlign = 'center'
          nodes.push({
            type: 'img',
            url: img.src,
            align: imgAlign,
            ...(width !== undefined && { width }),
            children: [{ text: '' }],
          })
          return
        }
        nodes.push({
          type: 'p',
          ...(align && { align }),
          children: convertInlineChildren(el),
        })
        return
      }
      case 'blockquote':
        nodes.push({
          type: 'blockquote',
          children: convertBlockOrInlineChildren(el),
        })
        return
      case 'ul':
        nodes.push({
          type: 'ul',
          children: convertListItems(el),
        })
        return
      case 'ol':
        nodes.push({
          type: 'ol',
          children: convertListItems(el),
        })
        return
      case 'table':
        nodes.push(convertTable(el))
        return
      case 'img': {
        const className = el.className || ''
        let align: string = 'center' // default to center
        if (className.includes('img-align-left')) align = 'left'
        else if (className.includes('img-align-right')) align = 'right'
        else if (className.includes('img-align-center')) align = 'center'

        const width = parseImgWidth(el as HTMLImageElement)

        nodes.push({
          type: 'img',
          url: (el as HTMLImageElement).src,
          align,
          ...(width !== undefined && { width }),
          children: [{ text: '' }],
        })
        return
      }
      case 'figure': {
        const img = el.querySelector('img') as HTMLImageElement | null
        if (img) {
          const width = parseImgWidth(img) ?? parseImgWidth(el as HTMLElement)
          // Check for alignment class on the img element
          const className = img.className || ''
          let align: string = 'center' // default to center
          if (className.includes('img-align-left')) align = 'left'
          else if (className.includes('img-align-right')) align = 'right'
          else if (className.includes('img-align-center')) align = 'center'
          nodes.push({
            type: 'img',
            url: img.src,
            align,
            ...(width !== undefined && { width }),
            children: [{ text: '' }],
          })
        }
        return
      }
      case 'hr':
        nodes.push({ type: 'hr', children: [{ text: '' }] })
        return
      case 'div': {
        // Column group: div.plate-column-group with div.plate-column children
        if (el.classList.contains('plate-column-group')) {
          const columnDivs = el.querySelectorAll(':scope > .plate-column')
          if (columnDivs.length >= 2) {
            const columns: Array<Record<string, unknown>> = []
            columnDivs.forEach((colEl) => {
              const width =
                (colEl as HTMLElement).style.flex?.match(/0 0 ([^)]+)/)?.[1] ??
                (colEl as HTMLElement).dataset.width ??
                `${100 / columnDivs.length}%`
              const colChildren = convertDomToPlate(colEl as Node)
              columns.push({
                type: 'column',
                width: String(width).endsWith('%') ? width : `${width}%`,
                children: colChildren.length > 0 ? colChildren : [{ type: 'p', children: [{ text: '' }] }],
              })
            })
            nodes.push({ type: 'column_group', children: columns })
            return
          }
        }
        // Generic divs - contain block content
        const children = convertDomToPlate(el)
        if (children.length > 0) {
          nodes.push(...children)
        }
        return
      }
      case 'br':
        // Ignore standalone BRs
        return
      default: {
        // Try to convert as block content
        const children = convertBlockOrInlineChildren(el)
        if (children.length > 0) {
          nodes.push({ type: 'p', children })
        }
      }
    }
  })

  return nodes
}

/**
 * Convert inline children (text, strong, em, a, etc.) to Plate text nodes.
 */
function convertInlineChildren(parent: Node): Array<Record<string, unknown>> {
  const children: Array<Record<string, unknown>> = []

  parent.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      children.push({ text: node.textContent || '' })
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    switch (tag) {
      case 'strong':
      case 'b':
        children.push(...convertInlineChildren(el).map((c) => ({ ...c, bold: true })))
        return
      case 'em':
      case 'i':
        children.push(...convertInlineChildren(el).map((c) => ({ ...c, italic: true })))
        return
      case 'u':
        children.push(...convertInlineChildren(el).map((c) => ({ ...c, underline: true })))
        return
      case 's':
      case 'del':
      case 'strike':
        children.push(...convertInlineChildren(el).map((c) => ({ ...c, strikethrough: true })))
        return
      case 'code':
        children.push(...convertInlineChildren(el).map((c) => ({ ...c, code: true })))
        return
      case 'mark':
        children.push(...convertInlineChildren(el).map((c) => ({ ...c, highlight: true })))
        return
      case 'a': {
        const url = (el as HTMLAnchorElement).href
        children.push({
          type: 'a',
          url,
          children: convertInlineChildren(el),
        })
        return
      }
      case 'img': {
        // Inline image - push as separate element (will be lifted to block level)
        children.push({ text: '' })
        return
      }
      case 'span': {
        const marks: Record<string, unknown> = {}
        if (el.style.color) marks.color = el.style.color
        if (el.style.backgroundColor) marks.backgroundColor = el.style.backgroundColor
        if (el.style.fontWeight && (el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight) >= 600)) {
          marks.bold = true
        }
        if (el.style.fontStyle === 'italic') marks.italic = true
        if (el.style.textDecoration?.includes('underline')) marks.underline = true

        children.push(...convertInlineChildren(el).map((c) => ({ ...c, ...marks })))
        return
      }
      case 'br':
        children.push({ text: '\n' })
        return
      default:
        children.push(...convertInlineChildren(el))
    }
  })

  if (children.length === 0) {
    children.push({ text: '' })
  }

  return children
}

/**
 * Convert children that might be block or inline content.
 */
function convertBlockOrInlineChildren(parent: Node): Array<Record<string, unknown>> {
  const hasBlockChild = Array.from(parent.childNodes).some((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return false
    const tag = (node as HTMLElement).tagName.toLowerCase()
    return ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'table', 'div', 'figure', 'hr'].includes(tag)
  })

  if (hasBlockChild) {
    const blocks = convertDomToPlate(parent)
    return blocks.length > 0 ? blocks : [{ type: 'p', children: [{ text: '' }] }]
  }

  return convertInlineChildren(parent)
}

/**
 * Convert list items.
 */
function convertListItems(parent: HTMLElement): Array<Record<string, unknown>> {
  const items: Array<Record<string, unknown>> = []

  parent.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    if (el.tagName.toLowerCase() !== 'li') return

    items.push({
      type: 'li',
      children: [{
        type: 'lic',
        children: convertInlineChildren(el),
      }],
    })
  })

  if (items.length === 0) {
    items.push({
      type: 'li',
      children: [{ type: 'lic', children: [{ text: '' }] }],
    })
  }

  return items
}

/**
 * Convert HTML table to Plate table structure.
 */
function convertTable(tableEl: HTMLElement): Record<string, unknown> {
  const rows: Array<Record<string, unknown>> = []
  const trElements = tableEl.querySelectorAll('tr')

  trElements.forEach((tr) => {
    const cells: Array<Record<string, unknown>> = []
    tr.childNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()
      if (tag !== 'td' && tag !== 'th') return

      cells.push({
        type: tag,
        children: convertBlockOrInlineChildren(el).length > 0
          ? convertBlockOrInlineChildren(el)
          : [{ type: 'p', children: [{ text: '' }] }],
      })
    })

    if (cells.length > 0) {
      rows.push({ type: 'tr', children: cells })
    }
  })

  return {
    type: 'table',
    children: rows.length > 0 ? rows : [{
      type: 'tr',
      children: [{ type: 'td', children: [{ type: 'p', children: [{ text: '' }] }] }],
    }],
  }
}

// ============================================================================
// Plate to HTML Serializer
// ============================================================================

/**
 * Serialize Plate value to HTML string.
 * Produces clean HTML compatible with the existing PDF/print pipeline.
 * Always returns at least a single empty paragraph to prevent empty content issues.
 */
function serializePlateToHtml(value: Value): string {
  if (!value || value.length === 0) {
    return '<p><br></p>'
  }
  const html = value.map((node) => serializeNode(node as Record<string, unknown>)).join('')
  return html || '<p><br></p>'
}

function serializeNode(node: Record<string, unknown>): string {
  // Text node (leaf)
  if ('text' in node) {
    return serializeText(node)
  }

  const type = (node.type as string) || 'p'
  const children = (node.children as Array<Record<string, unknown>>)
    ?.map((child) => serializeNode(child))
    .join('') || ''

  const align = node.align as string | undefined
  const style = align ? ` style="text-align: ${align}"` : ''

  // Preserve empty paragraphs and headings with <br> tag
  const isEmpty = !children || children.trim() === ''

  switch (type) {
    case 'title':
      return `<h1 class="document-title"${style}>${isEmpty ? '<br>' : children}</h1>`
    case 'p':
      return `<p${style}>${isEmpty ? '<br>' : children}</p>`
    case 'h1':
      return `<h1${style}>${isEmpty ? '<br>' : children}</h1>`
    case 'h2':
      return `<h2${style}>${isEmpty ? '<br>' : children}</h2>`
    case 'h3':
      return `<h3${style}>${isEmpty ? '<br>' : children}</h3>`
    case 'h4':
      return `<h4${style}>${isEmpty ? '<br>' : children}</h4>`
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`
    case 'ul':
      return `<ul>${children}</ul>`
    case 'ol':
      return `<ol>${children}</ol>`
    case 'li':
      return `<li>${children}</li>`
    case 'lic':
      return children
    case 'table':
      return `<table border="1" style="border-collapse: collapse; width: 100%;">${children}</table>`
    case 'tr':
      return `<tr>${children}</tr>`
    case 'td':
      return `<td style="border: 1px solid #d1d5db; padding: 0.75em;">${children}</td>`
    case 'th':
      return `<th style="border: 1px solid #d1d5db; padding: 0.75em; background-color: #f3f4f6; font-weight: 600;">${children}</th>`
    case 'a': {
      const url = (node.url as string) || '#'
      return `<a href="${escapeAttr(url)}">${children}</a>`
    }
      case 'img': {
        const url = (node.url as string) || ''
        const imgAlign = (node.align as string | undefined) || 'center' // default to center
        const imgWidth = node.width as number | string | undefined
        
        // Debug: log image node to see what properties it actually has
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          logger.debug('[Image Serialization] node:', { type: node.type, url: node.url, align: node.align, hasAlign: 'align' in node })
        }
        
        let className = ''
        if (imgAlign === 'left') className = 'img-align-left'
        else if (imgAlign === 'right') className = 'img-align-right'
        else if (imgAlign === 'center') className = 'img-align-center'
        const widthStyle =
          imgWidth !== undefined && imgWidth !== null
            ? ` style="width: ${typeof imgWidth === 'number' ? `${imgWidth}px` : imgWidth}"`
            : ''
        return `<img src="${escapeAttr(url)}"${className ? ` class="${className}"` : ''}${widthStyle} />`
      }
    case 'hr':
      return '<hr />'
    case 'column_group': {
      const colChildren = (node.children as Array<Record<string, unknown>>) || []
      const colHtml = colChildren
        .map((col) => {
          const width = (col.width as string) || '50%'
          return `<div class="plate-column" style="flex: 0 0 ${width}">${serializeNode(col)}</div>`
        })
        .join('')
      return `<div class="plate-column-group" style="display: flex; gap: 0.5rem;">${colHtml}</div>`
    }
    case 'column':
      return children
    default:
      return children
  }
}

function serializeText(node: Record<string, unknown>): string {
  let text = escapeHtml((node.text as string) || '')

  if (node.bold) text = `<strong>${text}</strong>`
  if (node.italic) text = `<em>${text}</em>`
  if (node.underline) text = `<u>${text}</u>`
  if (node.strikethrough) text = `<s>${text}</s>`
  if (node.code) text = `<code>${text}</code>`
  if (node.highlight) text = `<mark>${text}</mark>`

  // Wrap with span if color is set
  const styles: string[] = []
  if (node.color) styles.push(`color: ${node.color}`)
  if (node.backgroundColor) styles.push(`background-color: ${node.backgroundColor}`)

  if (styles.length > 0) {
    text = `<span style="${styles.join('; ')}">${text}</span>`
  }

  return text
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
