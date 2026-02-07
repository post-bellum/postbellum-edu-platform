'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'

// ============================================================================
// Toolbar Container
// ============================================================================

export function Toolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'flex items-center gap-0.5 border-b border-gray-200 bg-white px-2 py-1',
          className
        )}
        role="toolbar"
        {...props}
      />
    </TooltipProvider>
  )
}

// ============================================================================
// Toolbar Separator
// ============================================================================

export function ToolbarSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn('mx-1 h-6 w-px bg-gray-200', className)}
      role="separator"
    />
  )
}

// ============================================================================
// Toolbar Button
// ============================================================================

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string
  isActive?: boolean
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ className, tooltip, isActive, children, ...props }, ref) => {
    const button = (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium transition-colors',
          'hover:bg-gray-100 hover:text-gray-900',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
          'disabled:pointer-events-none disabled:opacity-50',
          isActive && 'bg-gray-100 text-gray-900',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      )
    }

    return button
  }
)
ToolbarButton.displayName = 'ToolbarButton'

// ============================================================================
// Toolbar Dropdown (for block type, alignment, etc.)
// ============================================================================

interface ToolbarDropdownProps {
  label: string
  tooltip?: string
  children: React.ReactNode
  className?: string
}

export function ToolbarDropdown({ label, tooltip, children, className }: ToolbarDropdownProps) {
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

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
        'hover:bg-gray-100 hover:text-gray-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
        open && 'bg-gray-100',
        className
      )}
    >
      {label}
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )

  return (
    <div ref={dropdownRef} className="relative">
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  )
}

interface ToolbarDropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
}

export function ToolbarDropdownItem({
  className,
  isActive,
  children,
  ...props
}: ToolbarDropdownItemProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors',
        'hover:bg-gray-100',
        isActive && 'bg-gray-50 font-medium text-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
