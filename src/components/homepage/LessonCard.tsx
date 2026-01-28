import { LessonThumbnail } from '@/components/lessons/LessonThumbnail';
import { ViewButton } from '@/components/ui/ViewButton';
import { generateLessonUrlFromLesson } from '@/lib/utils';
import type { Lesson } from '@/types/lesson.types';

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  const lessonUrl = generateLessonUrlFromLesson(lesson);
  
  return (
    <div className="flex flex-col gap-3 h-full">
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
          <span className="text-sm text-text-subtle leading-none">{lesson.period}</span>
        )}
        <h4 className="font-body text-xl font-semibold text-text-strong leading-[1.2] line-clamp-2">
          {lesson.title}
        </h4>
        {lesson.description && (
          <p className="text-sm text-text-subtle leading-[1.4] line-clamp-2">
            {lesson.description}
          </p>
        )}
      </div>
      
      <ViewButton href={lessonUrl} className="self-start" />
    </div>
  );
}
