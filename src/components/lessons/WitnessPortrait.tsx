import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface WitnessPortraitProps {
  src: string | null
  name: string
  /** Rendered diameter in pixels — 100 on cards, 200 in the detail modal */
  size: number
  className?: string
}

/**
 * Derive up to two initials from a witness name, used when no portrait is available.
 */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Circular witness portrait with an initials fallback.
 * Falls back when there is no portrait_url or when the image fails to load.
 */
export function WitnessPortrait({ src, name, size, className }: WitnessPortraitProps) {
  const [hasError, setHasError] = React.useState(false)

  // Reset error state when the source changes (e.g. switching witness in the modal)
  React.useEffect(() => {
    setHasError(false)
  }, [src])

  const showFallback = !src || hasError

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-full overflow-hidden bg-grey-100',
        // The design uses a slightly heavier ring on the larger modal portrait
        size >= 200 ? 'border-2 border-grey-950' : 'border-[1.563px] border-grey-950',
        className
      )}
      style={{ width: size, height: size }}
    >
      {showFallback ? (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-display font-semibold text-grey-500"
          style={{ fontSize: Math.round(size * 0.32) }}
        >
          {getInitials(name)}
        </span>
      ) : (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}
