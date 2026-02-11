'use client'

import * as React from 'react'

import type { PlateElementProps } from 'platejs/react'

import { type VariantProps, cva } from 'class-variance-authority'
import { PlateElement } from 'platejs/react'

import { cn } from '@/lib/utils'

const listVariants = cva('m-0 py-1 ps-6', {
  variants: {
    variant: {
      ol: 'list-decimal',
      ul: 'list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square]',
    },
  },
})

export function ListElement({
  variant,
  ...props
}: PlateElementProps & VariantProps<typeof listVariants>) {
  return (
    <PlateElement
      as={variant!}
      className={cn(listVariants({ variant }))}
      {...props}
    >
      {props.children}
    </PlateElement>
  )
}

export function BulletedListElement(props: PlateElementProps) {
  return <ListElement variant="ul" {...props} />
}

export function NumberedListElement(props: PlateElementProps) {
  return <ListElement variant="ol" {...props} />
}

export function ListItemElement(props: PlateElementProps) {
  return (
    <PlateElement as="li" {...props}>
      {props.children}
    </PlateElement>
  )
}
