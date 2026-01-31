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

export { Skeleton, CardSkeleton, FormSkeleton }
