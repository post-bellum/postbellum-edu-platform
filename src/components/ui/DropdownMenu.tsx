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
          className="w-[200px] rounded-[28px] bg-white shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] border border-grey-100 px-4 py-2.5 z-50 animate-in fade-in-0 zoom-in-95"
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
        'w-full flex items-center gap-1.5 px-2 py-2.5 text-left font-body text-md transition-colors cursor-pointer outline-none rounded-lg',
        'data-highlighted:bg-grey-50',
        variant === 'default' && 'text-text-subtle',
        variant === 'danger' && 'text-red-600 data-highlighted:bg-red-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon && <span className="text-grey-600">{icon}</span>}
      <span className="leading-normal">{children}</span>
    </DropdownMenuPrimitive.Item>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <DropdownMenuPrimitive.Separator 
      className={cn('my-1 h-px bg-grey-100', className)} 
    />
  )
}

export function DropdownMenuHeader({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuPrimitive.Label className="px-2 py-3 font-body text-md font-semibold text-text-strong">
      {children}
    </DropdownMenuPrimitive.Label>
  )
}
