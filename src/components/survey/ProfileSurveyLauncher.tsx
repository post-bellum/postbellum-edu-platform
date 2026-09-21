'use client'

import Image from 'next/image'

interface ProfileSurveyLauncherProps {
  label: string
  onClick: () => void
}

/** Floating button that opens the questionnaire; icon only on narrow screens */
export function ProfileSurveyLauncher({ label, onClick }: ProfileSurveyLauncherProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex cursor-pointer items-center gap-1 rounded-full bg-[#0c2727] py-1.5 pl-1.5 pr-1.5 text-lg font-semibold leading-7 text-mint-light transition-colors hover:bg-grey-950 sm:pr-3"
      data-testid="survey-launcher"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2ceeaa]">
        <Image
          src="/icons/message-text-circle.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
        />
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
