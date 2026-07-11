import Link from 'next/link'
import { Illustration } from '@/components/about'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-5 py-16">
      <div className="flex w-full max-w-[504px] flex-col items-center gap-10">
        <Illustration
          strokeSrc="/illustrations/about/illustration-direction-stroke.png"
          coloredSrc="/illustrations/about/illustration-direction-colored.png"
          alt="Ilustrace ukazování směru"
          animation="wipe-down"
          width={320}
          height={320}
        />

        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex w-full flex-col items-center gap-5 text-center">
            <h1 className="font-display text-3xl font-semibold leading-display text-text-strong">
              Tahle stránka nemá svůj příběh
            </h1>
            <p className="font-body text-lg font-normal leading-headline text-text-subtle">
              Vypadá to, že odkaz nikam nevede nebo se stránka přesunula. Nic se
              ale neztratilo. Vraťte se na úvod nebo prozkoumejte katalog lekcí.
            </p>
          </div>

          <div className="flex w-[260px] items-center justify-center gap-2">
            <Button asChild variant="primary" size="medium" className="flex-1">
              <Link href="/">Domů</Link>
            </Button>
            <Button asChild variant="secondary" size="medium" className="flex-1">
              <Link href="/lessons">Do katalogu</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
