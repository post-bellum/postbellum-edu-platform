'use client'

import * as React from 'react'
import { PlateElement, PlateLeaf } from 'platejs/react'
import type { PlateElementProps, PlateLeafProps } from 'platejs/react'
import { cn } from '@/lib/utils'

// ============================================================================
// Paragraph
// ============================================================================

export function ParagraphElement(props: PlateElementProps) {
  const { children, element, className } = props
  const align = (element as Record<string, unknown>).align as string | undefined

  return (
    <PlateElement
      {...props}
      as="p"
      className={cn('my-3 leading-7', className)}
      style={align ? { textAlign: align as React.CSSProperties['textAlign'] } : undefined}
    >
      {children}
    </PlateElement>
  )
}

// ============================================================================
// Headings
// ============================================================================

export function H1Element(props: PlateElementProps) {
  const { children, element, className } = props
  const align = (element as Record<string, unknown>).align as string | undefined

  return (
    <PlateElement
      {...props}
      as="h1"
      className={cn('mt-8 mb-4 font-display text-[28px] font-bold leading-tight', className)}
      style={align ? { textAlign: align as React.CSSProperties['textAlign'] } : undefined}
    >
      {children}
    </PlateElement>
  )
}

export function H2Element(props: PlateElementProps) {
  const { children, element, className } = props
  const align = (element as Record<string, unknown>).align as string | undefined

  return (
    <PlateElement
      {...props}
      as="h2"
      className={cn('mt-6 mb-3 font-display text-2xl font-semibold leading-snug', className)}
      style={align ? { textAlign: align as React.CSSProperties['textAlign'] } : undefined}
    >
      {children}
    </PlateElement>
  )
}

export function H3Element(props: PlateElementProps) {
  const { children, element, className } = props
  const align = (element as Record<string, unknown>).align as string | undefined

  return (
    <PlateElement
      {...props}
      as="h3"
      className={cn('mt-5 mb-2 font-display text-xl font-semibold leading-snug', className)}
      style={align ? { textAlign: align as React.CSSProperties['textAlign'] } : undefined}
    >
      {children}
    </PlateElement>
  )
}

export function H4Element(props: PlateElementProps) {
  const { children, element, className } = props
  const align = (element as Record<string, unknown>).align as string | undefined

  return (
    <PlateElement
      {...props}
      as="h4"
      className={cn('mt-4 mb-2 font-display text-lg font-semibold', className)}
      style={align ? { textAlign: align as React.CSSProperties['textAlign'] } : undefined}
    >
      {children}
    </PlateElement>
  )
}

// ============================================================================
// Blockquote
// ============================================================================

export function BlockquoteElement(props: PlateElementProps) {
  const { children, className } = props

  return (
    <PlateElement
      {...props}
      as="blockquote"
      className={cn('my-4 border-l-4 border-gray-300 pl-4 text-gray-600 italic', className)}
    >
      {children}
    </PlateElement>
  )
}

// ============================================================================
// Horizontal Rule
// ============================================================================

export function HrElement(props: PlateElementProps) {
  const { children, className } = props

  return (
    <PlateElement {...props} as="div" className={cn('my-6', className)}>
      <hr className="border-t-2 border-gray-200" />
      {children}
    </PlateElement>
  )
}

// ============================================================================
// Link
// ============================================================================

export function LinkElement(props: PlateElementProps) {
  const { element, children, className } = props
  const url = (element as Record<string, unknown>).url as string | undefined

  return (
    <PlateElement
      {...props}
      as="span"
      className={cn('inline', className)}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-primary underline hover:text-brand-primary-hover cursor-pointer"
      >
        {children}
      </a>
    </PlateElement>
  )
}

// ============================================================================
// Image
// ============================================================================

export function ImageElement(props: PlateElementProps) {
  const { element, children, className } = props
  const el = element as Record<string, unknown>
  const url = el.url as string | undefined
  const width = el.width as number | undefined
  const align = el.align as string | undefined

  const alignClass = cn(
    'my-4',
    align === 'center' && 'mx-auto',
    align === 'left' && 'float-left mr-4 mb-2',
    align === 'right' && 'float-right ml-4 mb-2',
    !align && 'mx-auto',
  )

  return (
    <PlateElement {...props} as="div" className={cn(alignClass, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        className="max-w-full rounded-md block"
        style={width ? { width } : undefined}
        draggable={false}
      />
      {children}
    </PlateElement>
  )
}

// ============================================================================
// Table
// ============================================================================

export function TableElement(props: PlateElementProps) {
  const { children, className } = props

  return (
    <PlateElement {...props} as="div" className={cn('my-4 overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <tbody>{children}</tbody>
      </table>
    </PlateElement>
  )
}

export function TableRowElement(props: PlateElementProps) {
  const { children, className } = props

  return (
    <PlateElement {...props} as="tr" className={cn('border-b border-gray-200', className)}>
      {children}
    </PlateElement>
  )
}

export function TableCellElement(props: PlateElementProps) {
  const { children, className } = props

  return (
    <PlateElement
      {...props}
      as="td"
      className={cn('border border-gray-300 p-2 align-top min-w-[80px]', className)}
    >
      {children}
    </PlateElement>
  )
}

export function TableCellHeaderElement(props: PlateElementProps) {
  const { children, className } = props

  return (
    <PlateElement
      {...props}
      as="th"
      className={cn('border border-gray-300 bg-gray-50 p-2 align-top font-semibold min-w-[80px]', className)}
    >
      {children}
    </PlateElement>
  )
}

// ============================================================================
// List
// ============================================================================

export function BulletedListElement(props: PlateElementProps) {
  const { children, className } = props

  return (
    <PlateElement {...props} as="ul" className={cn('my-3 ml-6 list-disc', className)}>
      {children}
    </PlateElement>
  )
}

export function NumberedListElement(props: PlateElementProps) {
  const { children, className } = props

  return (
    <PlateElement {...props} as="ol" className={cn('my-3 ml-6 list-decimal', className)}>
      {children}
    </PlateElement>
  )
}

export function ListItemElement(props: PlateElementProps) {
  const { children, className } = props

  return (
    <PlateElement {...props} as="li" className={cn('my-1', className)}>
      {children}
    </PlateElement>
  )
}

export function ListItemContentElement(props: PlateElementProps) {
  const { children } = props

  return (
    <PlateElement {...props} as="span">
      {children}
    </PlateElement>
  )
}

// ============================================================================
// Marks (Leaf rendering)
// ============================================================================

export function EditorLeaf(props: PlateLeafProps) {
  const { leaf, children } = props
  const l = leaf as Record<string, unknown>

  let result = children

  if (l.bold) {
    result = <strong>{result}</strong>
  }
  if (l.italic) {
    result = <em>{result}</em>
  }
  if (l.underline) {
    result = <u>{result}</u>
  }
  if (l.strikethrough) {
    result = <s>{result}</s>
  }
  if (l.code) {
    result = (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">
        {result}
      </code>
    )
  }

  const style: React.CSSProperties = {}
  if (l.color) {
    style.color = l.color as string
  }
  if (l.backgroundColor) {
    style.backgroundColor = l.backgroundColor as string
  }

  return (
    <PlateLeaf {...props} style={Object.keys(style).length > 0 ? style : undefined}>
      {result}
    </PlateLeaf>
  )
}
