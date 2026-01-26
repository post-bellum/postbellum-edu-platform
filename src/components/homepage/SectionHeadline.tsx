interface SectionHeadlineProps {
  title: string;
  description?: string;
  showArrow?: boolean;
}

export function SectionHeadline({ 
  title, 
  description,
  showArrow = true 
}: SectionHeadlineProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-10 w-full">
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-strong leading-[1.2]">
        {title}
      </h2>
      {(description || showArrow) && (
        <div className="flex items-start gap-10 flex-1 justify-end">
          {description && (
            <p className="font-body text-md text-text-subtle leading-[1.5] max-w-[560px]">
              {description}
            </p>
          )}
          {showArrow && (
            <div className="w-9 h-9 shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M27 9L9 27M9 27H21M9 27V15" stroke="#2CEEAA" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
