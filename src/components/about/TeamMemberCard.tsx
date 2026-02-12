import Image from 'next/image'
import { Mail } from 'lucide-react'

interface TeamMemberCardProps {
  name: string
  role?: string
  imageUrl?: string
  email?: string
}

export function TeamMemberCard({ name, role, imageUrl, email }: TeamMemberCardProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-10 px-5 py-8 bg-grey-50 border border-[rgba(12,17,29,0.05)] rounded-[28px] h-full min-h-[244px]">
      {/* Avatar and Info */}
      <div className="flex flex-col items-center gap-4 w-full">
        {imageUrl && (
          <div className="w-20 h-20 rounded-full border-[1.25px] border-grey-950 bg-grey-200 overflow-hidden shrink-0">
            <Image
              src={imageUrl}
              alt={name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Name and Role */}
        <div className="flex flex-col items-center gap-2 text-center w-full">
          <span className="font-body text-md font-semibold text-text-strong leading-[1.4]">
            {name}
          </span>
          {role && (
            <span className="font-body text-sm text-text-subtle leading-[1.4]">
              {role}
            </span>
          )}
        </div>
      </div>

      {/* Email button */}
      {email && (
        <a
          href={`mailto:${email}`}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-grey-100 hover:bg-grey-200 transition-colors"
          aria-label={`Napsat ${name}`}
        >
          <Mail className="w-4 h-4 text-grey-600" />
        </a>
      )}
    </div>
  )
}
