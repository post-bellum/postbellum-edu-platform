import Image from 'next/image'
import { getGravatarUrl } from '@/lib/gravatar'
import { Button } from '@/components/ui/Button'

interface AvatarSectionProps {
  /** User email for Gravatar */
  email: string
}

export function AvatarSection({ email }: AvatarSectionProps) {
  return (
    <div className="bg-white border border-grey-200 rounded-[28px] shadow-sm overflow-hidden w-full" data-testid="avatar-section">
      <div className="px-5 py-7 space-y-7">
        <div className="px-3">
          <h2 className="text-lg font-semibold text-black leading-snug mb-1.5">Avatar</h2>
          <p className="text-base text-text-subtle leading-body max-w-[480px]">
            Váš avatar je načítán ze služby{' '}
            <a 
              href="https://gravatar.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Gravatar
            </a>
            . Pro změnu profilového obrázku si vytvořte nebo upravte svůj Gravatar účet.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 px-2">
          <Image
            src={getGravatarUrl(email)}
            alt="Profile avatar"
            width={48}
            height={48}
            className="w-12 h-12 rounded-full border border-grey-950"
            data-testid="avatar-image"
          />
          <a
            href="https://gravatar.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="avatar-gravatar-link"
          >
            <Button 
              variant="quaternary" 
              size="small"
              className="flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Změnit na Gravatar.com
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

