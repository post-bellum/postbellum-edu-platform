'use client'

import * as React from 'react'
import type { PlateContentProps } from 'platejs/react'
import { PlateContent } from 'platejs/react'
import { cn } from '@/lib/utils'

// ============================================================================
// EditorContainer - wraps the editor with styling
// ============================================================================

interface EditorContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'demo'
}

export const EditorContainer = React.forwardRef<HTMLDivElement, EditorContainerProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full cursor-text overflow-y-auto',
          variant === 'default' && 'bg-gray-50',
          className
        )}
        {...props}
      />
    )
  }
)
EditorContainer.displayName = 'EditorContainer'

// ============================================================================
// Editor - the actual editable content area
// ============================================================================

export type EditorProps = Omit<PlateContentProps, 'value' | 'onChange'>

export const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  ({ className, ...props }, ref) => {
    return (
      <PlateContent
        ref={ref}
        className={cn(
          // Base editor styles
          'relative w-full whitespace-pre-wrap break-words',
          'outline-none',
          // Typography
          'text-base leading-7 text-gray-900',
          // Placeholder
          'data-[plate-placeholder]:text-gray-400',
          className
        )}
        disableDefaultStyles
        {...props}
      />
    )
  }
)
Editor.displayName = 'Editor'
