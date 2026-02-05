import { ReactNode } from 'react'

interface ContentSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function ContentSection({ title, children, className = '' }: ContentSectionProps) {
  return (
    <section className={`flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8 ${className}`}>
      <h2 className="font-display text-xl sm:text-2xl lg:text-[28px] xl:text-[32px] font-semibold text-text-strong leading-display">
        {title}
      </h2>
      {children}
    </section>
  )
}
