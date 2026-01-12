import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1 whitespace-nowrap font-semibold transition-colors cursor-pointer focus-visible:outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Post Bellum variants
        ultra:
          'bg-grey-950 text-white hover:bg-mint-light hover:text-grey-950 hover:border hover:border-grey-950 disabled:bg-grey-50 disabled:text-grey-300 disabled:border disabled:border-grey-100',
        primary:
          'bg-brand-primary text-mint-25 hover:bg-brand-primary-hover disabled:bg-grey-50 disabled:text-grey-300 disabled:border disabled:border-grey-100',
        secondary:
          'bg-white text-text-strong border border-grey-300 hover:bg-grey-50 disabled:bg-grey-50 disabled:text-grey-300 disabled:border-grey-100',
        tertiary:
          'bg-grey-100 text-grey-950 hover:bg-grey-200 disabled:bg-grey-50 disabled:text-grey-300',
        quaternary:
          'bg-white text-text-strong border border-grey-200 shadow-sm hover:border-grey-200 hover:bg-[rgba(0,0,0,0.02)] disabled:bg-grey-50 disabled:text-grey-300 disabled:border-grey-100',
        // Legacy variants (mapped to Post Bellum)
        default: 'bg-brand-primary text-mint-25 hover:bg-brand-primary-hover disabled:bg-grey-50 disabled:text-grey-300',
        destructive:
          'bg-red-600 text-white hover:bg-red-700',
        outline:
          'bg-white text-text-strong border border-grey-300 hover:bg-grey-50',
        ghost: 'hover:bg-grey-100 text-text-strong',
        link: 'text-brand-primary underline-offset-4 hover:underline hover:text-brand-primary-hover',
      },
      size: {
        // Post Bellum sizes
        large: 'h-[52px] px-7 py-3 text-lg leading-7 rounded-full',
        medium: 'h-12 px-5 py-2.5 text-lg leading-7 rounded-full',
        small: 'h-10 px-4 py-1.5 text-base leading-7 rounded-full',
        // Legacy sizes (mapped to Post Bellum)
        default: 'h-12 px-5 py-2.5 text-lg leading-7 rounded-full',
        sm: 'h-10 px-4 py-1.5 text-base leading-7 rounded-full',
        lg: 'h-[52px] px-7 py-3 text-lg leading-7 rounded-full',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
