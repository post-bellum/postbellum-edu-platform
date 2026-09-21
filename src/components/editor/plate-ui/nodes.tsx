'use client'

import * as React from 'react'
import { PlateElement } from 'platejs/react'
import type { PlateElementProps } from 'platejs/react'
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
// Title (Název) - bigger than H1
// ============================================================================

export function TitleElement(props: PlateElementProps) {
  const { children, element, className } = props
  const align = (element as Record<string, unknown>).align as string | undefined

  return (
    <PlateElement
      {...props}
      as="h1"
      className={cn('mt-10 mb-5 font-display text-[36px] font-bold leading-tight tracking-tight', className)}
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


