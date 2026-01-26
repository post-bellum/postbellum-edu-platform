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
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // For desktop: show 2 testimonials at a time
  const getDesktopTestimonials = () => {
    const startIndex = (testimonialIndex * 2) % testimonials.length;
    const first = testimonials[startIndex];
    const second = testimonials[(startIndex + 1) % testimonials.length];
    return [first, second];
  };

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 2));
  };

  const prevTestimonial = () => {
    const maxPages = Math.ceil(testimonials.length / 2);
    setTestimonialIndex((prev) => (prev - 1 + maxPages) % maxPages);
  };

  const desktopTestimonials = getDesktopTestimonials();
  const mobileTestimonial = testimonials[testimonialIndex % testimonials.length];

  return (
    <section>
      {/* Section Header - matching LessonsSection structure */}
      <div className="px-5 md:px-30 py-7 mb-6">
        <SectionHeadline
          title="Co o platformě říkají učitelé"
        />
      </div>
      
      {/* Testimonials */}
      <div className="px-5 md:px-10 pb-10 flex flex-col gap-8">
        {/* Desktop: Show 2 testimonials at a time */}
        <div className="hidden md:grid md:grid-cols-2 gap-5">
          {desktopTestimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={`${testimonialIndex}-${index}`}
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
    </section>
  );
}
