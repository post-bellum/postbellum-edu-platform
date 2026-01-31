import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminControls } from './AdminControls'

interface LessonDetailHeaderProps {
  lessonId: string
  shortId?: string | null
  title: string
  published: boolean
  isAdmin?: boolean
}

export function LessonDetailHeader({ lessonId, shortId, title, published, isAdmin }: LessonDetailHeaderProps) {
  return (
    <div>
      <div className="flex justify-between gap-4 2xl:mb-14">
        <div className="flex items-start gap-2">
          <Link 
            href="/lessons" 
            className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full text-brand-primary hover:bg-mint transition-colors translate-y-0.5"
            aria-label="Zpět na seznam lekcí"
          >
            <ArrowLeft className="w-7 h-7" />
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-semibold font-display leading-[1.2] text-grey-950">{title}</h1>
            {!published && (
              <span className="px-3 py-1 text-sm font-medium bg-orange-200 text-orange-800 rounded">
                Nepublikováno
              </span>
            )}
          </div>
        </div>
        <AdminControls 
          lessonId={lessonId} 
          lessonShortId={shortId} 
          lessonTitle={title} 
          showEditButton={true}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
