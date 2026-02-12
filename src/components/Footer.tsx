import Link from 'next/link'
import Image from 'next/image'
import { NewsletterSignup } from '@/components/homepage/NewsletterSignup'

export function Footer() {
  return (
    <footer className="w-full max-w-[1920px] mx-auto px-5 xl:px-10 py-0">
      <div className="flex flex-col items-start md:items-center w-full rounded-[28px] gap-1 md:gap-0">
        {/* Main footer content */}
        <div className="w-full bg-[#ddffee] border border-[rgba(12,17,29,0.05)] rounded-[40px] overflow-hidden pt-10 md:pt-15 pb-[120px] md:pb-[200px] px-5 md:px-11">
          <div className="flex flex-col md:flex-row md:justify-between gap-12 md:gap-0 w-full">
            {/* Left - Logo */}
            <div className="flex-1 flex gap-3 px-3 md:px-0 w-full md:w-auto">
              <Link href="https://www.postbellum.cz/" target="_blank">
                <Image
                  src="/logo-postbellum.svg"
                  alt="Post Bellum"
                  width={154}
                  height={16}
                  className="h-4 w-auto"
                />
              </Link>
            </div>

            {/* Right - Newsletter */}
            <NewsletterSignup />
          </div>
        </div>

        {/* Legal section */}
        <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center md:justify-between gap-5 md:gap-5 p-3 md:px-8 md:py-3 w-full">
          <p className="font-body text-xs text-text-subtle leading-6 min-w-full md:min-w-0 md:flex-1">
            © Post Bellum, {new Date().getFullYear()}
          </p>
          <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-0.5 md:gap-8 font-body text-xs text-text-subtle">
            <Link href="/terms" className="leading-6 hover:text-text-strong transition-colors">
              Podmínky služby
            </Link>
            <p className="leading-6">
              Ilustrace:{' '}
              <a 
                href="https://www.behance.net/jmikulastik" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-primary hover:text-text-strong hover:underline"
              >
                Jakub Mikuláštík
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
