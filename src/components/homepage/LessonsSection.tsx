'use client';

import { useState, useEffect, useMemo } from 'react';
import { LessonCard } from './LessonCard';
import { SectionHeadline } from './SectionHeadline';
import { getLessons } from '@/lib/supabase/lessons';
import { logger } from '@/lib/logger';
import { HOMEPAGE_LESSONS_COUNT } from '@/lib/constants';
import type { Lesson } from '@/types/lesson.types';
import type { HomepageLessons } from '@/types/page-content.types';

interface LessonsSectionProps {
  content: HomepageLessons
}

export function LessonsSection({ content }: LessonsSectionProps) {
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const featuredIds = content.featuredLessonIds;

  useEffect(() => {
    async function fetchLessons() {
      try {
        setError(false);
        const data = await getLessons({
          published_only: true,
          usePublicClient: true
        });
        setAllLessons(data);
      } catch (err) {
        logger.error('Error fetching lessons for homepage', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, []);

  const lessons = useMemo(() => {
    const curated = (featuredIds ?? [])
      .map((id) => allLessons.find((lesson) => lesson.id === id))
      .filter((lesson): lesson is Lesson => lesson !== undefined);

    return (curated.length > 0 ? curated : allLessons).slice(0, HOMEPAGE_LESSONS_COUNT);
  }, [allLessons, featuredIds]);

  return (
    <section className="px-5 xl:px-10">
      <div className="2xl:max-w-[1680px] mx-auto">
        {/* Section Header - OUTSIDE grey background */}
        <div className="px-5 xl:px-12 2xl:px-20 py-3 mb-10">
        <SectionHeadline
          title={content.sectionTitle}
          description={content.sectionDescription}
        />
      </div>
      
      {/* Grey background card area */}
      <div className="bg-grey-50 border border-grey-100 rounded-[28px] sm:rounded-[40px] md:rounded-[60px] pt-10 pb-8 md:pt-10">
        {/* Lessons Grid */}
        <div className="px-5 xl:px-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 lg:gap-20">
              {[...Array(HOMEPAGE_LESSONS_COUNT)].map((_, i) => (
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
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-text-subtle">Nepodařilo se načíst lekce. Zkuste to prosím později.</p>
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
      </div>
    </section>
  );
}
