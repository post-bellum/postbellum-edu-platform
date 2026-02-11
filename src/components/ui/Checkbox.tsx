import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'group peer h-4 w-4 shrink-0 rounded-md border border-grey-400 bg-transparent cursor-pointer transition-colors',
      'focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary data-[state=checked]:text-white',
      'relative',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-3 w-3 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
    {/* Focus ring */}
    <span 
      className="absolute inset-[-2px] rounded-md border-[3px] border-mint-light opacity-0 group-focus-visible:opacity-100 pointer-events-none" 
      style={{ filter: 'blur(1px)' }} 
    />
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
