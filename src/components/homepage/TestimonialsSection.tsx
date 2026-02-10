'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TestimonialCard } from './TestimonialCard';
import { SectionHeadline } from './SectionHeadline';
import type { HomepageTestimonials } from '@/types/page-content.types';
import { DEFAULT_HOMEPAGE_CONTENT } from '@/lib/page-content/defaults';

interface TestimonialsSectionProps {
  content?: HomepageTestimonials
}

export function TestimonialsSection({ content }: TestimonialsSectionProps) {
  const data = content ?? DEFAULT_HOMEPAGE_CONTENT.testimonials
  const items = data.items
  const [currentIndex, setCurrentIndex] = useState(0);

  // Desktop shows 2 testimonials, mobile shows 1
  const getVisibleTestimonials = (count: number) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(items[(currentIndex + i) % items.length]);
    }
    return result;
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const desktopTestimonials = getVisibleTestimonials(2);
  const mobileTestimonial = items[currentIndex];

  return (
    <section className="px-5 xl:px-10">
      <div className="2xl:max-w-[1680px] mx-auto">
        {/* Section Header - matching LessonsSection structure */}
        <div className="px-5 xl:px-12 2xl:px-20 py-7 mb-6">
        <SectionHeadline
          title={data.sectionTitle}
        />
      </div>

      {/* Testimonials */}
      <div className="pb-10 flex flex-col gap-8">
        {/* Desktop: Show 2 testimonials at a time */}
        <div className="hidden md:grid md:grid-cols-2 md:items-stretch gap-5">
          {desktopTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={`${currentIndex}-${index}`}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              avatarUrl={testimonial.imageUrl}
            />
          ))}
        </div>

        {/* Mobile: Show 1 testimonial with carousel */}
        <div className="md:hidden">
          <TestimonialCard
            quote={mobileTestimonial.quote}
            name={mobileTestimonial.name}
            role={mobileTestimonial.role}
            avatarUrl={mobileTestimonial.imageUrl}
          />
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-end gap-2">
          <button
            onClick={prevTestimonial}
            className="rounded-full border-[1.25px] border-grey-200 bg-white flex items-center justify-center px-5 py-2.5 hover:bg-grey-50 transition-colors shadow-sm"
            aria-label="Předchozí recenze"
          >
            <ArrowLeft className="w-4 h-4 text-grey-600" />
          </button>
          <button
            onClick={nextTestimonial}
            className="rounded-full border-[1.25px] border-grey-200 bg-white flex items-center justify-center px-5 py-2.5 hover:bg-grey-50 transition-colors shadow-sm"
            aria-label="Další recenze"
          >
            <ArrowRight className="w-4 h-4 text-grey-600" />
          </button>
        </div>
      </div>
      </div>
    </section>
  );
}
