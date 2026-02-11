interface PrincipleCardProps {
  title: string
  description: string
}

export function PrincipleCard({ title, description }: PrincipleCardProps) {
  return (
    <div className="flex flex-col gap-10 p-5 bg-grey-50 border border-[rgba(12,17,29,0.05)] rounded-[28px] min-h-[276px] min-w-[280px] text-center">
      <h3 className="font-body text-md font-semibold text-text-strong leading-[1.4]">
        {title}
      </h3>
      <p className="font-body text-sm text-text-subtle leading-[1.4]">
        {description}
      </p>
    </div>
  )
}
