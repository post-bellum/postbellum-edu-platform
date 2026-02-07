interface PageHeaderProps {
  title: string
}

export function PageHeader({ 
  title
}: PageHeaderProps) {
  return (
    <header className="flex flex-col pt-5 md:pt-8 lg:pt-16 pb-8 sm:pb-10 md:pb-20 xl:pb-[120px]">
      <h1 className="font-display text-2xl sm:text-[28px] md:text-4xl lg:text-[44px] font-semibold text-text-strong leading-display">
        {title}
      </h1>
    </header>
  )
}
