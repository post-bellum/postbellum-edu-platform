'use client';

import { FeatureCard } from './FeatureCard';
import { SectionHeadline } from './SectionHeadline';

const features = [
  {
    title: 'Autentická videa pamětníků',
    description: 'Přineste do třídy skutečné příběhy lidí, kteří zažili historické události na vlastní kůži.',
    icon: '/illustrations/homepage/videa.png',
  },
  {
    title: 'Lekce pro ZŠ i SŠ s různou délkou',
    description: 'Lekce jsou připravené pro základní i střední školy ve variantách na 30, 45 i 90 minut.',
    icon: '/illustrations/homepage/lekce_pro_zs.png',
  },
  {
    title: 'Metodické a pracovní listy k úpravě',
    description: 'Připravené materiály pro výuku, které si snadno upravíte a stáhnete jako PDF.',
    icon: '/illustrations/homepage/pracovni_listy.png',
  },
  {
    title: 'Rozvoj gramotností',
    description: 'Žáci si procvičí kritické myšlení, práci s informacemi a porozumění dějinám v souvislostech.',
    icon: '/illustrations/homepage/rozvoj_gramotnosti.png',
  },
  {
    title: 'Doprovodné aktivity pro žáky',
    description: 'Využijte připravené Kahoot kvízy a další interaktivní prvky k upevnění klíčových pojmů a souvislostí.',
    icon: '/illustrations/homepage/doprovodne_aktivity.png',
  },
  {
    title: 'Hodnotové a mezigenerační vzdělávání',
    description: 'Podporujte platformou kritické myšlení a diskuze mezi generacemi pomocí autentických příběhů.',
    icon: '/illustrations/homepage/mezigeneracni_vzdelavani.png',
  },
];

export function FeaturesSection() {
  return (
    <section className="px-5 xl:px-10">
      <div className="2xl:max-w-[1680px] mx-auto">
        {/* Section Header */}
        <div className="px-5 xl:px-12 2xl:px-20 py-8">
          <SectionHeadline
            title="Platforma nabízí"
            description="Všechny materiály jsou připravené tak, abyste je mohli rovnou využít ve výuce – bez zbytečné administrativy nebo technických překážek."
          />
        </div>
        
        {/* Features Grid */}
        <div className="px-5 xl:px-12 2xl:px-20 py-16 xl:py-30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 max-w-[1280px] mx-auto">
            {features.map((feature, index) => (
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
