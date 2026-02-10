'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ImageReveal } from '@/components/ui/ImageReveal';
import { Button } from '@/components/ui/Button';
import { Ticker } from './Ticker';
import type { HomepageHero } from '@/types/page-content.types';

interface HeroSectionProps {
  content: HomepageHero
  tickerText: string
}

export function HeroSection({ content, tickerText }: HeroSectionProps) {
  return (
    <section className="px-5 xl:px-10">
      <div className="bg-[#e2f2f2] rounded-[28px] sm:rounded-[40px] md:rounded-[60px] overflow-hidden border border-grey-100">
        {/* Hero Content */}
        <div className="flex flex-col items-center px-5 pt-8 sm:py-10">
          <div className="flex flex-col items-center gap-4 sm:gap-5 max-w-[680px] w-full py-5">
            <h1 className="font-display text-[36px] sm:text-3xl md:text-4xl lg:text-[44px] font-semibold text-text-strong text-center leading-display">
              {content.title}
            </h1>
            <Button variant="mint" size="large" asChild className="z-10">
              <Link href={content.buttonHref}>{content.buttonText}</Link>
            </Button>
          </div>
        </div>
        
        {/* Mobile Hero Illustration - Students */}
        <div className="md:hidden relative w-full h-[283px] flex items-center justify-center">
          <div className="relative w-[320px] h-[293px] -mb-4">
            <Image
              src="/illustrations/homepage/illustration-studenti-colored.png"
              alt="Studenti u stolu"
              fill
              className="object-contain"
              sizes="320px"
              priority
            />
          </div>
        </div>

        {/* Desktop Hero Illustration */}
        <div className="hidden md:block relative w-full aspect-1024/300 lg:aspect-1440/464">
          <div className="absolute left-0 right-0 bottom-[-40px] xl:bottom-[-82px] aspect-4096/2000">
            <ImageReveal
              strokeSrc="/illustrations/homepage/illustration-stroke.png"
              coloredSrc="/illustrations/homepage/illustration-colored.png"
              alt="Vzdělávací ilustrace"
              width={4096}
              height={2000}
              animation="crossfade"
              duration={1000}
              autoPlay={true}
              autoPlayDelay={200}
              fill={true}
              objectFit="cover"
              sizes="100vw"
              className="w-full h-full"
            />
          </div>
        </div>
        
        {/* Ticker */}
        <Ticker text={tickerText} />
      </div>
    </section>
  );
}
