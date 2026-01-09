'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
}

export function DropdownMenu({ trigger, children, align = 'end' }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button className="cursor-pointer bg-transparent border-none p-0" type="button">
          {trigger}
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={8}
          className="w-64 rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95"
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

interface DropdownMenuItemProps {
  onClick?: () => void | Promise<void>
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
    <DropdownMenuPrimitive.Item
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors cursor-pointer outline-none',
        'data-highlighted:bg-gray-100',
        variant === 'default' && 'text-gray-700',
        variant === 'danger' && 'text-red-600 data-highlighted:bg-red-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </DropdownMenuPrimitive.Item>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <DropdownMenuPrimitive.Separator 
      className={cn('my-1 h-px bg-gray-200', className)} 
    />
  )
}

export function DropdownMenuHeader({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuPrimitive.Label className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
      {children}
    </DropdownMenuPrimitive.Label>
  )
}
