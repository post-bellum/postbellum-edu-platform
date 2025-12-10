import * as React from 'react'
import { FavoritesList } from '@/components/favorites/FavoritesList'

// Private route - requires authentication
export const dynamic = 'force-dynamic'

function FavoritesLoading() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Oblíbené lekce</h1>
      <div className="text-center py-12">
        <p className="text-gray-500">Načítání oblíbených lekcí...</p>
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Oblíbené lekce</h1>
      <React.Suspense fallback={<FavoritesLoading />}>
        <FavoritesList />
      </React.Suspense>
    </div>
  )
}
