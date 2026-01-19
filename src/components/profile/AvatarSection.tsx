import Image from 'next/image'
import { getGravatarUrl } from '@/lib/gravatar'

interface AvatarSectionProps {
  /** User email for Gravatar */
  email: string
}

export function AvatarSection({ email }: AvatarSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4" data-testid="avatar-section">
      <h2 className="text-xl font-semibold">Avatar</h2>
      <p className="text-sm text-gray-600">
        Avatar je vaše profilová fotka - každý, kdo navštíví váš profil, uvidí tuto fotku.
      </p>
      <div className="flex items-center space-x-4">
        <Image
          src={getGravatarUrl(email)}
          alt="Profile avatar"
          width={80}
          height={80}
          className="w-20 h-20 rounded-full"
          data-testid="avatar-image"
        />
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Vaše profilová fotka je načtena z Gravatar.com
          </p>
          <a
            href="https://gravatar.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
            data-testid="avatar-gravatar-link"
          >
            Změnit na Gravatar.com →
          </a>
        </div>
      </div>
    </div>
  )
}

