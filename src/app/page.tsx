import { 
  HeroSection,
  FeaturesSection,
  LessonsSection,
  TestimonialsSection,
  BottomIllustration,
} from '@/components/homepage';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col gap-5 pt-5 pb-20">
      <HeroSection />
      <FeaturesSection />
      <LessonsSection />
      <TestimonialsSection />
      <BottomIllustration />
    </main>
  );
}
