import { ImageReveal, AnimationType } from '../ui/ImageReveal'

interface IllustrationProps {
  strokeSrc: string
  coloredSrc: string
  alt?: string
  animation?: AnimationType
  width?: number
  height?: number
  className?: string
}

export function Illustration({ 
  strokeSrc, 
  coloredSrc, 
  alt = '', 
  animation = 'crossfade',
  width = 320,
  height = 320, 
  className = '',
}: IllustrationProps) {
  return (
    <section className={`flex justify-center py-8 md:py-0 mx-auto ${className}`}>
      <div className="w-full h-full">
        <ImageReveal
          strokeSrc={strokeSrc}
          coloredSrc={coloredSrc}
          alt={alt}
          width={width}
          height={height}
          animation={animation}
          duration={3000}
          triggerOnScroll={true}
          autoPlayDelay={200}
          className="w-full h-full"
        />
      </div>
    </section>
  )
}
