'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function DropdownMenu({ trigger, children, align = 'end', className }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button className="group cursor-pointer bg-transparent border-none p-0 outline-none focus:outline-none focus-visible:outline-none" type="button">
          {trigger}
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={8}
          className={cn('w-[280px] rounded-[28px] bg-white shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] border border-grey-100 px-5 py-2.5 z-50 animate-in fade-in-0 zoom-in-95', className)}
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
  className?: string
}

export function DropdownMenuItem({
  onClick,
  icon,
  children,
  variant = 'default',
  disabled = false,
  className
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-1.5 pl-2 pr-4 py-2.5 text-left font-body text-md transition-colors cursor-pointer outline-none rounded-lg',
        'data-highlighted:bg-grey-50',
        variant === 'default' && 'text-text-subtle',
        variant === 'danger' && 'text-red-600 data-highlighted:bg-red-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && (
        <span className={cn(variant === 'danger' ? 'text-red-600' : 'text-grey-600')}>
          {icon}
        </span>
      )}
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

interface DropdownMenuHeaderProps {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  className?: string
  [key: `data-${string}`]: string | undefined
}

export function DropdownMenuHeader({ children, onClick, className, ...props }: DropdownMenuHeaderProps) {
  if (onClick) {
    return (
      <DropdownMenuPrimitive.Item
        onClick={onClick}
        className={cn(
          'w-full flex items-center px-2 py-3 rounded-lg font-body text-md font-semibold text-text-strong',
          'cursor-pointer outline-none transition-colors data-highlighted:bg-grey-50',
          className
        )}
        {...props}
      >
        <span className="min-w-0 truncate">{children}</span>
      </DropdownMenuPrimitive.Item>
    )
  }

  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        'px-2 py-3 font-body text-md font-semibold text-text-strong text-ellipsis overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Label>
  )
}
