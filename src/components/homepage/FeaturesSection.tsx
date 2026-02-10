'use client';

import { FeatureCard } from './FeatureCard';
import { SectionHeadline } from './SectionHeadline';
import type { HomepageFeatures } from '@/types/page-content.types';
import { DEFAULT_HOMEPAGE_CONTENT } from '@/lib/page-content/defaults';

interface FeaturesSectionProps {
  content?: HomepageFeatures
}

export function FeaturesSection({ content }: FeaturesSectionProps) {
  const data = content ?? DEFAULT_HOMEPAGE_CONTENT.features

  return (
    <section className="px-5 xl:px-10">
      <div className="2xl:max-w-[1680px] mx-auto">
        {/* Section Header */}
        <div className="px-5 xl:px-12 2xl:px-20 py-8">
          <SectionHeadline
            title={data.sectionTitle}
            description={data.sectionDescription}
          />
        </div>

        {/* Features Grid */}
        <div className="px-5 xl:px-12 2xl:px-20 py-16 xl:py-30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 max-w-[1280px] mx-auto">
            {data.items.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
