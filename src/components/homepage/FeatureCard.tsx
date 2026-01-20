import Image from 'next/image';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="w-20 h-20 relative">
        <Image
          src={icon}
          alt=""
          width={80}
          height={80}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-body text-xl font-semibold text-text-strong leading-[1.2]">
          {title}
        </h3>
        <p className="font-body text-md text-text-subtle leading-[1.5]">
          {description}
        </p>
      </div>
    </div>
  );
}
