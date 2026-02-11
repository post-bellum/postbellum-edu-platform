'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    
    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-2xl border border-grey-300 bg-white px-5 py-3 text-lg text-text-strong leading-[1.4] placeholder:text-grey-600 transition-colors hover:border-grey-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-grey-50 disabled:border-grey-200 disabled:text-grey-400',
            isFocused && 'border-grey-400',
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
            className="absolute inset-[-2px] rounded-2xl pointer-events-none border-[3px] border-mint-light"
            style={{ filter: 'blur(1px)' }}
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
