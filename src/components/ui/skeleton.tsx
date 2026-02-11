import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-grey-100', className)}
      {...props}
    />
  )
}

/**
 * Reusable skeleton for card-like containers (forms, sections, etc.)
 * Uses the same rounded-[28px] style as other cards in the design system
 */
function CardSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  )
}

/**
 * Form skeleton with multiple cards - for lesson edit/new pages
 */
function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Main form card */}
      <div className="bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden">
        <div className="p-6 lg:p-10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
      {/* Actions card */}
      <div className="bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden">
        <div className="p-6 flex justify-end gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

/**
 * Lesson card skeleton - matches LessonCard layout
 */
function LessonCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 md:gap-8 items-start">
      {/* Thumbnail skeleton */}
      <Skeleton className="w-[189px] sm:w-[200px] md:w-[260px] lg:w-[316px] h-[120px] sm:h-[130px] md:h-[170px] lg:h-[200px] rounded-xl sm:rounded-2xl md:rounded-3xl shrink-0" />
      
      {/* Content skeleton */}
      <div className="flex-1 flex flex-col gap-5 sm:gap-5 md:gap-7 sm:py-3 md:py-5 min-w-0">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-7 w-3/4 max-w-[400px]" />
          <Skeleton className="h-4 w-full max-w-[600px]" />
          <Skeleton className="h-4 w-2/3 max-w-[400px]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>

      {/* View button skeleton */}
      <div className="hidden sm:flex flex-col items-center justify-center self-stretch shrink-0">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  )
}

/**
 * Favorites list skeleton - shows multiple lesson card skeletons
 */
function FavoritesSkeleton() {
  return (
    <div className="flex flex-col gap-10 sm:gap-10">
      <LessonCardSkeleton />
      <LessonCardSkeleton />
      <LessonCardSkeleton />
    </div>
  )
}

export { Skeleton, CardSkeleton, FormSkeleton, LessonCardSkeleton, FavoritesSkeleton }
