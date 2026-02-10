import Image from 'next/image';

export function ComingSoonHero() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-16 bg-linear-to-b from-white via-mint-light to-[#e2f2f2]">
      {/* Logo */}
      <div className="mb-12 md:mb-16">
        <Image
          src="/logo-storyon.svg"
          alt="StoryOn"
          width={200}
          height={36}
          priority
          className="w-[160px] md:w-[200px] h-auto"
        />
      </div>

      {/* Main headline */}
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-text-strong text-center leading-tight mb-6 max-w-3xl">
        Již brzy!
      </h1>

      {/* Subheadline */}
      <p className="text-xl sm:text-2xl md:text-3xl text-text-subtle text-center max-w-2xl leading-relaxed mb-4">
        Připravujeme pro vás něco speciálního.
      </p>

      <p className="text-lg text-grey-500 text-center max-w-xl">
        Brzy zde najdete platformu pro vzdělávání a sdílení příběhů.
      </p>

      {/* Illustration - mobile */}
      <div className="mt-12 md:hidden relative w-full max-w-[320px] aspect-320/293">
        <Image
          src="/illustrations/homepage/illustration-studenti-colored.png"
          alt="Studenti u stolu"
          fill
          className="object-contain"
          sizes="320px"
        />
      </div>

      {/* Illustration - desktop */}
      <div className="mt-12 hidden md:block relative w-full max-w-4xl aspect-4096/2000">
        <Image
          src="/illustrations/homepage/illustration-colored.png"
          alt="Vzdělávací ilustrace"
          fill
          className="object-contain"
          sizes="(max-width: 896px) 100vw, 896px"
        />
      </div>

      {/* Decorative element */}
      <div className="mt-12 md:mt-16 w-24 h-1 rounded-full bg-brand-primary/30" />
    </div>
  );
}
