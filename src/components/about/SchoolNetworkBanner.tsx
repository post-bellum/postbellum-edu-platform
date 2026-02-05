import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ImageReveal } from '../ui/ImageReveal'

interface SchoolNetworkBannerProps {
  title?: string
  buttonText?: string
  buttonHref?: string
  illustrationSrc?: string
}

export function SchoolNetworkBanner({
  title = 'Na seminář v síti škol Paměti národa se můžete registrovat zde',
  buttonText = 'Registrovat',
  buttonHref = 'https://www.pametnaroda.cz/cs/sit-skol',
  illustrationSrc = '/illustrations/about/banner-illustration.png',
}: SchoolNetworkBannerProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-10 items-stretch md:items-center bg-[#ddffee] border border-[rgba(12,17,29,0.05)] rounded-[28px] overflow-hidden p-6 md:px-10 md:py-6">
      {/* Illustration */}
      <div className="flex-1 w-full md:w-auto">
        <div className="relative w-full aspect-[313/155] md:aspect-[448/232]">
          <ImageReveal
            strokeSrc="/illustrations/about/illustration-network-colored.png"
            coloredSrc="/illustrations/about/illustration-network-colored.png"
            alt=""
            width={420}
            height={216}
            animation="crossfade"
            duration={3000}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-4 w-full md:w-auto">
        <p className="font-display text-lg md:text-xl lg:text-2xl font-semibold text-text-strong leading-[1.2]">
          {title}
        </p>
        <Button variant="primary" size="medium" asChild className="w-fit">
          <Link href={buttonHref} target="_blank" rel="noopener noreferrer">
            {buttonText}
          </Link>
        </Button>
      </div>
    </div>
  )
}
