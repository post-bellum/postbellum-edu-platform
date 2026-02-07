import Image from 'next/image';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="w-20 h-20 relative" aria-hidden="true">
        <Image
          src={icon}
          alt=""
          width={80}
          height={80}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-body text-xl font-semibold text-text-strong leading-display">
          {title}
        </h3>
        <p className="font-body text-md text-text-subtle leading-[1.5]">
          {description}
        </p>
      </div>
    </div>
  );
}
