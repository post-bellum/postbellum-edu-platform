'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, onRightIconClick, ...props }, ref) => {
    const hasLeftIcon = !!leftIcon
    const hasRightIcon = !!rightIcon
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-grey-400">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-full border border-grey-300 bg-white px-5 py-3 text-lg text-text-strong leading-[1.4] placeholder:text-grey-600 transition-colors hover:border-grey-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-grey-50 disabled:border-grey-200 disabled:text-grey-400',
            isFocused && 'border-grey-400',
            hasLeftIcon && 'pl-12',
            hasRightIcon && 'pr-12',
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        {/* Focus ring */}
        {isFocused && !props.disabled && (
          <div
            className="absolute inset-[-2px] rounded-full pointer-events-none border-[3px] border-mint-light"
            style={{ filter: 'blur(1px)' }}
          />
        )}
        {rightIcon && (
          <div 
            className={cn(
              'absolute right-5 top-1/2 -translate-y-1/2 text-grey-400',
              onRightIconClick && 'cursor-pointer hover:text-text-strong transition-colors'
            )}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
