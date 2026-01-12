'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export function Footer() {
  const [email, setEmail] = React.useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter subscription
    console.log('Subscribe:', email)
  }

  return (
    <footer className="w-full px-5 md:px-10 py-0">
      <div className="flex flex-col items-start md:items-center w-full rounded-[28px] gap-1 md:gap-0 max-w-[1680px] mx-auto">
        {/* Main footer content */}
        <div className="w-full bg-[#ddffee] border border-[rgba(12,17,29,0.05)] rounded-[40px] overflow-hidden pt-10 md:pt-15 pb-[120px] md:pb-[200px] px-5">
          <div className="flex flex-col gap-0 md:gap-0 items-start md:items-center md:px-6 w-full max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row items-start md:justify-between gap-15 md:gap-0 w-full">
              {/* Left - Logo */}
              <div className="flex-1 flex items-center gap-3 px-3 md:px-0 w-full md:w-auto">
                <Link href="/">
                  <Image
                    src="/logo-storyon.svg"
                    alt="StoryOn"
                    width={154}
                    height={16}
                  />
                </Link>
              </div>

              {/* Right - Newsletter */}
              <div className="flex-1 flex flex-col gap-6 items-start max-w-full md:max-w-[500px] w-full">
                <div className="flex flex-col gap-3.5 items-start px-3 w-full">
                  <h3 className="font-display text-2xl font-semibold leading-display text-text-strong w-full">
                    Nechte mě vědět o novinkách
                  </h3>
                  <p className="font-body text-sm leading-[1.4] text-text-subtle w-full">
                    Buďte první, kdo se dozví o nové lekci inspirované životními příběhy.
                  </p>
                </div>

                {/* Email input with button */}
                <form onSubmit={handleSubscribe} className="relative w-full h-12">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@postbellum.cz"
                    className="w-full h-12 bg-white border border-grey-300 rounded-full px-5 py-3 font-body text-lg text-grey-600 placeholder:text-grey-600 focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="small"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
                  >
                    Odběr
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Legal section */}
        <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center md:justify-between gap-5 md:gap-5 p-3 md:px-8 md:py-3 w-full">
          <p className="font-body text-xs text-text-subtle leading-6 min-w-full md:min-w-0 md:flex-1">
            © Post Bellum, {new Date().getFullYear()}
          </p>
          <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center gap-0.5 md:gap-8 font-body text-xs text-text-subtle">
            <Link href="/privacy" className="leading-6 hover:text-text-strong transition-colors">
              Zásady ochrany osobních údajů
            </Link>
            <Link href="/terms" className="leading-6 hover:text-text-strong transition-colors">
              Podmínky služby
            </Link>
            <p className="leading-6">
              Ilustrace:{' '}
              <a 
                href="https://www.instagram.com/jakubmikulastik" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2ceeaa] hover:underline"
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
