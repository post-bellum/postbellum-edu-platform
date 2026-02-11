'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContentFormSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function ContentFormSection({ title, children, defaultOpen = false }: ContentFormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-grey-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-grey-50 hover:bg-grey-100 transition-colors cursor-pointer"
      >
        <span className="font-display font-semibold text-lg text-text-strong">{title}</span>
        <ChevronDown className={cn('w-5 h-5 text-grey-500 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="px-5 py-5 flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  )
}
