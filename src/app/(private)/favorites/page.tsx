import * as React from 'react'
import { FavoritesList } from '@/components/favorites/FavoritesList'
import { FavoritesSkeleton } from '@/components/ui/skeleton'

// Private route - requires authentication
export const dynamic = 'force-dynamic'

export default function FavoritesPage() {
  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5 mb-16">
      {/* Header Section */}
      <div className="flex flex-col gap-4 pb-16 md:pb-20 lg:pb-24 pt-10">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-text-strong leading-display">
          Oblíbené lekce
        </h1>
      </div>
      <React.Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesList />
      </React.Suspense>
    </div>
  )
}
