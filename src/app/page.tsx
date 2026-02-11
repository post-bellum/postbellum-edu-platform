import {
  HeroSection,
  FeaturesSection,
  LessonsSection,
  TestimonialsSection,
  BottomIllustration,
} from '@/components/homepage';
import { getPageContent } from '@/lib/supabase/page-content'
import type { HomepageContent } from '@/types/page-content.types'

export default async function Home() {
  const content = await getPageContent<HomepageContent>('homepage')

  return (
    <main className="min-h-screen flex flex-col gap-5 pt-5 pb-20">
      <HeroSection content={content.hero} tickerText={content.ticker.text} />
      <FeaturesSection content={content.features} />
      <LessonsSection content={content.lessons} />
      <TestimonialsSection content={content.testimonials} />
      <BottomIllustration />
    </main>
  );
}
