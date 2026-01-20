'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <section className="px-5 md:px-10">
      <div className="max-w-[1840px] mx-auto">
        {/* Section Header */}
        <div className="px-5 md:px-20 py-8">
          <SectionHeadline
            title="Co o platformě říkají učitelé"
            showArrow={false}
          />
        </div>
        
        {/* Testimonials */}
        <div className="px-5 md:px-10 lg:px-20 pb-10">
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
          <div className="flex justify-end gap-2 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-[60px] h-10 rounded-full border border-grey-200 bg-white flex items-center justify-center hover:bg-grey-50 transition-colors shadow-sm"
              aria-label="Předchozí recenze"
            >
              <ChevronLeft className="w-5 h-5 text-grey-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="w-[60px] h-10 rounded-full border border-grey-200 bg-white flex items-center justify-center hover:bg-grey-50 transition-colors shadow-sm"
              aria-label="Další recenze"
            >
              <ChevronRight className="w-5 h-5 text-grey-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
