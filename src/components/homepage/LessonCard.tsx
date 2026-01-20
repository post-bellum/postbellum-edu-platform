import Link from 'next/link';
import { Eye } from 'lucide-react';
import { LessonThumbnail } from '@/components/lessons/LessonThumbnail';
import type { Lesson } from '@/types/lesson.types';

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Thumbnail */}
      <div className="relative aspect-[379/240] rounded-3xl overflow-hidden border border-grey-200 bg-grey-100 shrink-0">
        <LessonThumbnail
          src={lesson.thumbnail_url}
          alt={lesson.title}
        />
      </div>
      
      {/* Content - grows to fill space, pushes button down */}
      <div className="flex flex-col gap-3 py-5 flex-1">
        {lesson.period && (
          <span className="text-sm text-text-subtle leading-[1.4]">{lesson.period}</span>
        )}
        <h4 className="font-body text-xl font-semibold text-text-strong leading-[1.2] line-clamp-2">
          {lesson.title}
        </h4>
        {lesson.description && (
          <p className="text-sm text-text-subtle leading-[1.4] line-clamp-3">
            {lesson.description}
          </p>
        )}
      </div>
      
      <Link 
        href={`/lessons/${lesson.id}`}
        className="flex items-center justify-center w-full px-5 py-2.5 rounded-full border border-grey-200 bg-white shadow-sm hover:bg-grey-50 transition-colors"
      >
        <Eye className="w-5 h-5 text-grey-500" />
      </Link>
    </div>
  );
}
