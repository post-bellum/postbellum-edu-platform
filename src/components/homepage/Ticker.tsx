import Image from 'next/image';

export function Ticker() {
  return (
    <div className="w-full overflow-hidden py-8">
      {/* Animated marquee for all screen sizes */}
      <div className="flex items-center gap-[60px] animate-marquee">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-[60px] shrink-0">
            <Image 
              src="/logo-pamet-naroda.svg" 
              alt="Paměť národa" 
              width={200} 
              height={36}
              className="h-[36px] md:h-[56px] w-auto shrink-0"
            />
            <span className="font-display text-2xl font-semibold text-text-strong whitespace-nowrap">
              StoryOn přináší paměť národa.
            </span>
            <Image 
              src="/logo-postbellum.svg" 
              alt="Post Bellum" 
              width={168} 
              height={17}
              className="h-[17px] w-auto shrink-0"
            />
            <span className="font-display text-2xl font-semibold text-text-strong whitespace-nowrap">
              StoryOn přináší paměť národa.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
