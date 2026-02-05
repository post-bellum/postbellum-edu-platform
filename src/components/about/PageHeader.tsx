import { Breadcrumbs, type BreadcrumbItem } from '@/components/lessons/Breadcrumbs'

interface PageHeaderProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
}

export function PageHeader({ 
  title, 
  breadcrumbs = [
    { label: 'Domů', href: '/' },
    { label: 'O projektu' }
  ] 
}: PageHeaderProps) {
  return (
    <header className="flex flex-col pt-5 md:pt-8 lg:pt-16 pb-8 sm:pb-10 md:pb-16 lg:pb-[120px]">
      <h1 className="font-display text-2xl sm:text-[28px] md:text-4xl lg:text-[44px] font-semibold text-text-strong leading-[1.2]">
        {title}
      </h1>
    </header>
  )
}
