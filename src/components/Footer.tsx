import Link from 'next/link'
import Image from 'next/image'
import { NewsletterSignup } from '@/components/homepage/NewsletterSignup'
import {
  MailIcon,
  ExternalLinkIcon,
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
  LinkedinIcon,
} from '@/components/icons'

// X (Twitter) intentionally omitted. LinkedIn has no link yet — rendered as a
// non-interactive placeholder until the URL is available.
const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/VzdelavaniPametiNaroda/', Icon: FacebookIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@pametnaroda', Icon: YoutubeIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/vzdelavani_pameti_naroda/', Icon: InstagramIcon },
  { label: 'LinkedIn', href: null, Icon: LinkedinIcon },
]

export function Footer() {
  return (
    <footer className="w-full max-w-[1920px] mx-auto px-5 xl:px-10 py-0">
      <div className="flex flex-col items-start md:items-center w-full rounded-[28px] gap-1 md:gap-0">
        {/* Main footer content */}
        <div className="w-full bg-[#ddffee] border border-[rgba(12,17,29,0.05)] rounded-[40px] overflow-hidden py-10 md:py-15 px-5 md:px-11">
          <div className="flex flex-col gap-12 md:grid md:grid-cols-2 md:grid-rows-[1fr_auto] md:gap-x-16 lg:gap-x-24 md:gap-y-10 md:min-h-65 w-full">
            {/* Left top - Logo & contact info */}
            <div className="order-1 md:col-start-1 md:row-start-1 flex flex-col gap-10 items-start px-3 md:px-0">
              <Link href="https://www.postbellum.cz/" target="_blank">
                <Image
                  src="/logo-postbellum.svg"
                  alt="Post Bellum"
                  width={154}
                  height={16}
                  className="h-4 w-auto"
                />
              </Link>

              <div className="flex flex-col gap-5 items-start">
                <p className="font-body text-sm leading-[1.4] text-text-subtle">
                  Španělská 1073/10
                  <br />
                  120 00 Praha 2
                </p>

                <div className="flex flex-col gap-1.5 items-start font-body text-sm">
                  <a
                    href="mailto:storyon@postbellum.cz"
                    className="flex gap-2 items-center text-brand-primary hover:text-brand-primary-hover transition-colors"
                  >
                    <MailIcon className="size-4 shrink-0" />
                    storyon@postbellum.cz
                  </a>
                  <a
                    href="https://skoly.pametnaroda.cz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-2 items-center text-brand-primary hover:text-brand-primary-hover transition-colors"
                  >
                    <ExternalLinkIcon className="size-4 shrink-0" />
                    Vzdělávání Paměti národa
                  </a>
                </div>
              </div>
            </div>

            {/* Right - Newsletter (spans both rows on desktop) */}
            <div className="order-2 md:col-start-2 md:row-span-2 w-full flex md:justify-end">
              <NewsletterSignup />
            </div>

            {/* Left bottom - Social icons */}
            <div className="order-3 md:col-start-1 md:row-start-2 md:self-end flex gap-2 items-center px-3 md:px-0">
              {socialLinks.map(({ label, href, Icon }) => {
                const circleClass =
                  'flex items-center justify-center size-11 rounded-full bg-mint'

                return href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`${circleClass} transition-opacity hover:opacity-80`}
                  >
                    <Icon className="size-6" />
                  </a>
                ) : (
                  <span key={label} aria-label={label} className={circleClass}>
                    <Icon className="size-6" />
                  </span>
                )
              })}
            </div>
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
