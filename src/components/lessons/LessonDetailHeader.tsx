import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminControls } from './AdminControls'

interface LessonDetailHeaderProps {
  lessonId: string
  title: string
  published: boolean
}

export function LessonDetailHeader({ lessonId, title, published }: LessonDetailHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link 
            href="/lessons" 
            className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full text-brand-primary hover:bg-mint transition-colors translate-y-0.5"
            aria-label="Zpět na seznam lekcí"
          >
            <ArrowLeft className="w-7 h-7" />
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold font-display leading-none">{title}</h1>
            {!published && (
              <span className="px-3 py-1 text-sm font-medium bg-orange-200 text-orange-800 rounded">
                Nepublikováno
              </span>
            )}
          </div>
        </div>
        {/* AdminControls handles its own visibility via client-side admin check */}
        <AdminControls lessonId={lessonId} lessonTitle={title} showEditButton={true} />
      </div>
    </div>
  )
}
