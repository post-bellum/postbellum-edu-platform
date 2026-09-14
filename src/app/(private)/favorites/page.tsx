import * as React from 'react'
import { FavoritesList } from '@/components/favorites/FavoritesList'
import { FavoritesSkeleton } from '@/components/ui/skeleton'
import { FavoritesTabs } from '@/components/favorites/FavoritesTabs'

// Private route - requires authentication
export const dynamic = 'force-dynamic'

export default function FavoritesPage() {
  return (
    <div className="w-full px-5 xl:px-10 2xl:px-[120px] py-5 mb-16">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-10 md:mb-12 pt-10">
        <h1 className="font-display text-4xl md:text-[44px] font-semibold text-text-strong leading-display">
          Oblíbené lekce
        </h1>
      </div>
      
      {/* Two Column Layout with responsive tabs */}
      <div className="md:flex gap-11 lg:gap-20">
        <aside className="shrink-0">
          <FavoritesTabs />
        </aside>

        <main className="flex-1 min-w-0">
          <React.Suspense fallback={<FavoritesSkeleton />}>
            <FavoritesList />
          </React.Suspense>
        </main>
      </div>
    </div>
  )
}
