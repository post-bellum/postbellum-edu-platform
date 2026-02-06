interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export function TestimonialCard({ quote, name, role, avatarUrl }: TestimonialCardProps) {
  return (
    <div className="flex flex-col justify-between bg-grey-50 border border-[rgba(12,17,29,0.05)] rounded-[28px] p-5 sm:p-10 h-[260px]">
      <p className="font-body text-xl font-semibold text-text-strong leading-[1.4]">
        {quote}
      </p>
      <div className="flex items-center gap-4 mt-6">
        <div className="w-14 h-14 rounded-full border-[1.25px] border-grey-950 bg-grey-200 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-grey-500 text-xs">Foto</span>
          )}
        </div>
        <div className="flex flex-col mt-2">
          <span className="font-body text-md font-semibold text-text-strong leading-[1.4]">
            {name}
          </span>
          <span className="font-body text-sm text-text-subtle leading-[1.4]">
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}
