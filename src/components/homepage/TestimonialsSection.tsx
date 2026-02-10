'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TestimonialCard } from './TestimonialCard';
import { SectionHeadline } from './SectionHeadline';

const testimonials = [
  {
    quote: '„Používám videa pamětníků jako úvod do tématu a následně rozvíjím diskuzi se studenty. Materiály mi šetří čas a hodiny jsou mnohem živější."',
    name: 'Dominika Kopčiková',
    role: 'učitelka dějepisu',
  },
  {
    quote: '„Platforma je jednoduchá na použití a skvěle zapadá do RVP. Oceňuji přehlednost a že nemusíme nic instalovat."',
    name: 'Eva Mikulášková',
    role: 'učitelka dějepisu',
  },
  {
    quote: '„Je to super, že můžeme používat platformu i u dětí, kteří nemají přístup k internetu."',
    name: 'Tomáš Spáčil',
    role: 'učitel dějepisu',
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Desktop shows 2 testimonials, mobile shows 1
  const getVisibleTestimonials = (count: number) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return result;
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const desktopTestimonials = getVisibleTestimonials(2);
  const mobileTestimonial = testimonials[currentIndex];

  return (
    <section className="px-5 xl:px-10">
      <div className="2xl:max-w-[1680px] mx-auto">
        {/* Section Header - matching LessonsSection structure */}
        <div className="px-5 xl:px-12 2xl:px-20 py-7 mb-6">
        <SectionHeadline
          title="Co o platformě říkají učitelé"
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
            />
          ))}
        </div>
        
        {/* Mobile: Show 1 testimonial with carousel */}
        <div className="md:hidden">
          <TestimonialCard 
            quote={mobileTestimonial.quote}
            name={mobileTestimonial.name}
            role={mobileTestimonial.role}
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
