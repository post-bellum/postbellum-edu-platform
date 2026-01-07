'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
}

export function DropdownMenu({ trigger, children, align = 'right' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 w-64 rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownMenuItemProps {
  onClick?: () => void
  icon?: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'danger'
  disabled?: boolean
}

export function DropdownMenuItem({ 
  onClick, 
  icon, 
  children, 
  variant = 'default',
  disabled = false 
}: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer',
        variant === 'default' && 'text-gray-700 hover:bg-gray-50',
        variant === 'danger' && 'text-red-600 hover:bg-red-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <div className={cn('my-1 h-px bg-gray-200', className)} />
}

interface DropdownMenuHeaderProps {
  children: React.ReactNode
}

export function DropdownMenuHeader({ children }: DropdownMenuHeaderProps) {
  return (
    <div className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
      {children}
    </div>
  )
}

