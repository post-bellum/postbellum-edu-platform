'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PrincipleCard } from './PrincipleCard'

interface Principle {
  title: string
  description: string
}

interface PrinciplesCarouselProps {
  sectionTitle: string
  principles: Principle[]
}

export function PrinciplesCarousel({ sectionTitle, principles }: PrinciplesCarouselProps) {
  const totalRealCards = principles.length
  
  // Clone ALL cards on both ends for smooth infinite scroll with 3 visible cards
  // Structure: [clone of all] + [original] + [clone of all]
  // Example with 3 cards: [p0,p1,p2, p0,p1,p2, p0,p1,p2]
  const extendedPrinciples = [
    ...principles, // clones at start
    ...principles, // original
    ...principles, // clones at end
  ]
  
  // Start at index = totalRealCards (first card in the middle/original section)
  const startIndex = totalRealCards
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true)

  const goToPrevious = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsTransitionEnabled(true)
    setCurrentIndex((prev) => prev - 1)
  }, [isAnimating])

  const goToNext = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsTransitionEnabled(true)
    setCurrentIndex((prev) => prev + 1)
  }, [isAnimating])

  // Handle infinite loop jump
  useEffect(() => {
    if (!isAnimating) return

    const timeout = setTimeout(() => {
      // If we've scrolled into the trailing clones, jump back to original section
      if (currentIndex >= startIndex + totalRealCards) {
        setIsTransitionEnabled(false)
        setCurrentIndex(currentIndex - totalRealCards)
      }
      // If we've scrolled into the leading clones, jump forward to original section
      else if (currentIndex < startIndex) {
        setIsTransitionEnabled(false)
        setCurrentIndex(currentIndex + totalRealCards)
      }
      setIsAnimating(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [currentIndex, isAnimating, startIndex, totalRealCards])

  // Gap between cards in pixels
  const gap = 20

  return (
    <section className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8">
      {/* Header with title and navigation arrows */}
      <div className="flex items-center gap-1">
        <h2 className="flex-1 font-display text-xl sm:text-2xl lg:text-[28px] xl:text-[32px] font-semibold text-text-strong leading-display">
          {sectionTitle}
        </h2>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={goToPrevious}
            disabled={isAnimating}
            className="flex items-center justify-center w-7 h-7 text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
            aria-label="Předchozí princip"
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={1.5} />
          </button>
          <button
            onClick={goToNext}
            disabled={isAnimating}
            className="flex items-center justify-center w-7 h-7 text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
            aria-label="Další princip"
          >
            <ChevronRight className="w-7 h-7" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Cards Container - Infinite Carousel */}
      {/* Mobile: 1 card visible, moves 100% per step */}
      <div className="overflow-hidden sm:hidden">
        <div
          className={`flex gap-5 ${isTransitionEnabled ? 'transition-transform duration-300 ease-in-out' : ''}`}
          style={{
            transform: `translateX(calc(-${currentIndex} * (100% + ${gap}px)))`,
          }}
        >
          {extendedPrinciples.map((principle, index) => (
            <div
              key={`mobile-${principle.title}-${index}`}
              className="w-full shrink-0"
            >
              <PrincipleCard
                title={principle.title}
                description={principle.description}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet: 2 cards visible, moves 50% per step */}
      <div className="overflow-hidden hidden sm:block lg:hidden">
        <div
          className={`flex gap-5 ${isTransitionEnabled ? 'transition-transform duration-300 ease-in-out' : ''}`}
          style={{
            // Each card is (100% - 1*gap) / 2, move by card width + gap
            transform: `translateX(calc(-${currentIndex} * ((100% - ${gap}px) / 2 + ${gap}px)))`,
          }}
        >
          {extendedPrinciples.map((principle, index) => (
            <div
              key={`tablet-${principle.title}-${index}`}
              className="w-[calc((100%-20px)/2)] shrink-0"
            >
              <PrincipleCard
                title={principle.title}
                description={principle.description}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: 3 cards visible, moves ~33.33% per step */}
      <div className="overflow-hidden hidden lg:block">
        <div
          className={`flex gap-5 ${isTransitionEnabled ? 'transition-transform duration-300 ease-in-out' : ''}`}
          style={{
            // Each card is (100% - 2*gap) / 3, move by card width + gap
            transform: `translateX(calc(-${currentIndex} * ((100% - ${gap * 2}px) / 3 + ${gap}px)))`,
          }}
        >
          {extendedPrinciples.map((principle, index) => (
            <div
              key={`desktop-${principle.title}-${index}`}
              className="w-[calc((100%-40px)/3)] shrink-0"
            >
              <PrincipleCard
                title={principle.title}
                description={principle.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
