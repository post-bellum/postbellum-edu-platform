'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toggleFavoriteAction } from '@/app/actions/favorites'
import { Button } from '@/components/ui/Button'
import { Heart, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface FavoriteButtonProps {
  lessonId: string
  initialIsFavorited?: boolean
  className?: string
  variant?: 'default' | 'sidebar'
}

export function FavoriteButton({
  lessonId,
  initialIsFavorited = false,
  className,
  variant = 'default',
}: FavoriteButtonProps) {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = React.useState(initialIsFavorited)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const result = await toggleFavoriteAction(lessonId)
      if (result.success) {
        setIsFavorited(result.isFavorited ?? !isFavorited)
        router.refresh()
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sidebar variant - matches Figma design
  if (variant === 'sidebar') {
    return (
      <Button
        variant="secondary"
        size="medium"
        onClick={handleToggle}
        disabled={isLoading}
        className={cn('w-full justify-center', className)}
      >
        <Bookmark
          className={cn(
            'w-5 h-5',
            isFavorited && 'fill-current'
          )}
        />
        {isFavorited ? 'V oblíbených' : 'Přidat do oblíbených'}
      </Button>
    )
  }

  // Default variant
  return (
    <Button
      variant={isFavorited ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(className)}
    >
      <Heart
        className={cn(
          'h-4 w-4',
          isFavorited && 'fill-current'
        )}
      />
      {isFavorited ? 'V oblíbených' : 'Přidat do oblíbených'}
    </Button>
  )
}
