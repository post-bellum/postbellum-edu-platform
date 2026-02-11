'use client'

import * as React from 'react'
import Image from 'next/image'

interface LessonThumbnailProps {
  src: string | null
  alt: string
}

/**
 * Client component for lesson thumbnail with error handling.
 * Falls back to placeholder if image fails to load.
 */
export function LessonThumbnail({ src, alt }: LessonThumbnailProps) {
  const [hasError, setHasError] = React.useState(false)

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false)
  }, [src])

  if (!src || hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-grey-300/50" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 189px, (max-width: 768px) 200px, (max-width: 1024px) 260px, 316px"
      onError={() => setHasError(true)}
    />
  )
}
