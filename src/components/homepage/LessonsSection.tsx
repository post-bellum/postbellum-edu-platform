'use client';

import { useState, useEffect } from 'react';
import { LessonCard } from './LessonCard';
import { SectionHeadline } from './SectionHeadline';
import { getLessons } from '@/lib/supabase/lessons';
import { logger } from '@/lib/logger';
import type { Lesson } from '@/types/lesson.types';

export function LessonsSection() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const data = await getLessons({ 
          published_only: true,
          usePublicClient: true 
        });
        // Take only first 4 lessons for homepage
        setLessons(data.slice(0, 4));
      } catch (error) {
        logger.error('Error fetching lessons for homepage', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLessons();
  }, []);

  return (
    <section className="px-5 md:px-10">
      {/* Section Header - OUTSIDE grey background */}
      <div className="px-5 md:px-20 py-3 mb-10">
        <SectionHeadline
          title="Vybrané lekce pro vás"
          description="Pravidelně přidáváme nové materiály, které reagují na aktuální výuková témata. Vše připraveno tak, aby šlo ihned použít ve třídě – bez složité přípravy."
        />
      </div>
      
      {/* Grey background card area */}
      <div className="bg-grey-50 border border-grey-100 rounded-[28px] sm:rounded-[40px] md:rounded-[60px] pt-10 pb-12 md:pt-10 md:pb-[60px]">
        {/* Lessons Grid */}
        <div className="px-5 md:px-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 lg:gap-20">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4 animate-pulse">
                  <div className="aspect-[379/240] rounded-3xl bg-grey-200" />
                  <div className="flex flex-col gap-3 py-5 flex-1">
                    <div className="h-4 w-16 bg-grey-200 rounded" />
                    <div className="h-6 w-full bg-grey-200 rounded" />
                    <div className="h-4 w-3/4 bg-grey-200 rounded" />
                  </div>
                  <div className="h-10 w-10 mx-auto bg-grey-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : lessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 lg:gap-20">
              {lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-subtle">Zatím nejsou k dispozici žádné lekce.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
