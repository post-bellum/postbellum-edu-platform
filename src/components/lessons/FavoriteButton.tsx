"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toggleFavoriteAction } from "@/app/actions/favorites"
import { Button } from "@/components/ui/Button"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  lessonId: string
  initialIsFavorited?: boolean
  className?: string
}

export function FavoriteButton({
  lessonId,
  initialIsFavorited = false,
  className,
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
      console.error("Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(className)}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          isFavorited && "fill-current"
        )}
      />
      {isFavorited ? "V oblíbených" : "Přidat do oblíbených"}
    </Button>
  )
}

