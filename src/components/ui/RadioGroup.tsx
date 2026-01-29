import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { cn } from '@/lib/utils'

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'group aspect-square h-4 w-4 rounded-full border border-grey-400 bg-transparent cursor-pointer transition-colors',
        'focus:outline-none focus-visible:outline-none',
        'disabled:cursor-not-allowed',
        'data-[state=unchecked]:disabled:border-grey-200',
        'data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary',
        'data-[state=checked]:disabled:bg-grey-200 data-[state=checked]:disabled:border-grey-200',
        'relative',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-[0px_2px_3px_0px_rgba(0,0,0,0.1)]" />
      </RadioGroupPrimitive.Indicator>
      {/* Focus ring */}
      <span 
        className="absolute inset-[-2px] rounded-full border-[3px] border-mint-light opacity-0 group-focus-visible:opacity-100 pointer-events-none" 
        style={{ filter: 'blur(1px)' }} 
      />
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
