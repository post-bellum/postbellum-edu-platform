import Image from 'next/image'

interface PartnerCardProps {
  name: string
  description: string
  logoSrc: string
  logoAlt?: string
  logoWidth?: number
  logoHeight?: number
  className?: string
}

export function PartnerCard({
  name,
  description,
  logoSrc,
  logoAlt,
  logoWidth = 190,
  logoHeight = 88,
  className = '',
}: PartnerCardProps) {
  return (
    <div className={`flex flex-col items-center gap-4 py-6 md:py-10 ${className}`}>
      {/* Logo */}
      <div className="h-[60px] md:h-[88px] flex items-center justify-center">
        <Image
          src={logoSrc}
          alt={logoAlt || name}
          width={logoWidth}
          height={logoHeight}
          className="max-h-[60px] md:max-h-[88px] w-auto object-contain"
        />
      </div>
      
      {/* Text */}
      <div className="flex flex-col items-center gap-1 md:gap-2 text-center w-full">
        <span className="font-body text-sm md:text-md font-semibold text-text-strong leading-[1.4]">
          {name}
        </span>
        <span className="font-body text-xs md:text-md text-text-subtle leading-[1.4]">
          {description}
        </span>
      </div>
    </div>
  )
}

interface PartnerCardFullProps extends PartnerCardProps {
  // Full-width variant for main sponsor
  fullWidth?: boolean
}

export function PartnerCardFull({
  name,
  description,
  logoSrc,
  logoAlt,
  logoWidth = 190,
  logoHeight = 88,
}: PartnerCardFullProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-8 bg-grey-50 border border-[rgba(12,17,29,0.05)] rounded-[28px] w-full">
      {/* Logo */}
      <div className="h-[60px] md:h-[88px] flex items-center justify-center">
        <Image
          src={logoSrc}
          alt={logoAlt || name}
          width={logoWidth}
          height={logoHeight}
          className="max-h-[60px] md:max-h-[88px] w-auto object-contain"
        />
      </div>
      
      {/* Text */}
      <div className="flex flex-col items-center gap-1 md:gap-2 text-center w-full">
        <span className="font-body text-sm md:text-md font-semibold text-text-strong leading-[1.4]">
          {name}
        </span>
        <span className="font-body text-xs md:text-md text-text-subtle leading-[1.4]">
          {description}
        </span>
      </div>
    </div>
  )
}
