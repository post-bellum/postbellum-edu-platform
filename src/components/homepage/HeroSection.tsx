'use client';

import Link from 'next/link';
import { ImageReveal } from '@/components/ui/ImageReveal';
import { Button } from '@/components/ui/Button';
import { Ticker } from './Ticker';

export function HeroSection() {
  return (
    <section className="px-5 md:px-10">
      <div className="bg-[#e2f2f2] rounded-[28px] sm:rounded-[40px] md:rounded-[60px] overflow-hidden border border-grey-100">
        {/* Hero Content */}
        <div className="flex flex-col items-center px-5 py-10">
          <div className="flex flex-col items-center gap-4 sm:gap-5 max-w-[680px] w-full">
            <h1 className="font-display text-[28px] sm:text-3xl md:text-4xl lg:text-[44px] font-semibold text-text-strong text-center leading-[1.2]">
              Zapněte příběhy do své výuky.
            </h1>
            <Button variant="mint" size="large" asChild className="z-10">
              <Link href="/lessons">Přejít na lekce</Link>
            </Button>
          </div>
        </div>
        
        {/* Hero Illustration */}
        <div className="relative w-full aspect-353/300 sm:aspect-768/350 md:aspect-1024/400 lg:aspect-1440/464">
          <div className="absolute left-0 right-0 bottom-[-40px] sm:bottom-[-60px] md:bottom-[-82px] aspect-4096/2000">
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
        <Ticker />
      </div>
    </section>
  );
}
