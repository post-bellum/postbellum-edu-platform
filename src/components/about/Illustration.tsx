import { ImageReveal, AnimationType } from '../ui/ImageReveal'

interface IllustrationProps {
  strokeSrc: string
  coloredSrc: string
  alt?: string
  animation?: AnimationType
  width?: number
  height?: number
  className?: string
  duration?: number
  autoPlayDelay?: number
}

export function Illustration({ 
  strokeSrc, 
  coloredSrc, 
  alt = '', 
  animation = 'crossfade',
  width = 320,
  height = 320, 
  className = '',
  duration = 1000,
  autoPlayDelay = 100,
}: IllustrationProps) {
  return (
    <section className={`flex justify-center py-8 md:py-0 w-full h-full ${className}`}>
        <ImageReveal
          strokeSrc={strokeSrc}
          coloredSrc={coloredSrc}
          alt={alt}
          width={width}
          height={height}
          animation={animation}
          duration={duration}
          triggerOnScroll={true}
          autoPlayDelay={autoPlayDelay}
        />
    </section>
  )
}
