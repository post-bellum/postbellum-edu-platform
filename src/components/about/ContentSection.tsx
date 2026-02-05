import { ReactNode } from 'react'

interface ContentSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function ContentSection({ title, children, className = '' }: ContentSectionProps) {
  return (
    <section className={`flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8 ${className}`}>
      <h2 className="font-display text-xl sm:text-2xl md:text-[32px] font-semibold text-grey-950 leading-[1.2]">
        {title}
      </h2>
      {children}
    </section>
  )
}
