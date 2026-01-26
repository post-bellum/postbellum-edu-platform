'use client';

import { ImageReveal } from '@/components/ui/ImageReveal';

export function BottomIllustration() {
  return (
    <section className="flex justify-center py-8 md:py-0">
      <div className="w-[220px] md:w-[300px] h-[200px] md:h-[275px]">
        <ImageReveal
          strokeSrc="/illustrations/homepage/illustration-studenti-stroke.png"
          coloredSrc="/illustrations/homepage/illustration-studenti-colored.png"
          alt="Ilustrace studentů"
          width={285}
          height={285}
          animation="circle-expand"
          duration={3000}
          triggerOnScroll={true}
          autoPlayDelay={200}
          className="w-full h-full"
        />
      </div>
    </section>
  );
}
