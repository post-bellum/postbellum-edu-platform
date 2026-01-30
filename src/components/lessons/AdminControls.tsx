'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Plus, Edit } from 'lucide-react'
import { DeleteLessonButton } from '@/components/lessons/DeleteLessonButton'
import { useIsAdmin } from '@/lib/supabase/hooks/useIsAdmin'
import { generateLessonUrl } from '@/lib/utils'

interface AdminControlsProps {
  lessonId?: string
  lessonShortId?: string | null // Prefer short_id for SEO-friendly URLs
  lessonTitle?: string
  showNewButton?: boolean
  showEditButton?: boolean // Show edit button for lesson detail page
}

export function AdminControls({ 
  lessonId, 
  lessonShortId,
  lessonTitle, 
  showNewButton = false,
  showEditButton = false 
}: AdminControlsProps) {
  const { isAdmin, loading } = useIsAdmin()

  if (loading || !isAdmin) return null

  // Generate proper SEO-friendly edit URL using short_id if available
  const editUrl = lessonId && lessonTitle 
    ? `${generateLessonUrl(lessonShortId || lessonId, lessonTitle)}/edit`
    : null

  return (
    <>
      {showNewButton && (
        <Link href="/lessons/new">
          <Button>
            <Plus />
            Nová lekce
          </Button>
        </Link>
      )}
      {showEditButton && editUrl && lessonId && lessonTitle && (
        <div className="flex gap-2">
          <Link href={editUrl}>
            <Button>
              <Edit />
              Upravit lekci
            </Button>
          </Link>
          <DeleteLessonButton lessonId={lessonId} lessonTitle={lessonTitle} />
        </div>
      )}
      {!showEditButton && editUrl && lessonId && lessonTitle && (
        <div className="flex gap-2">
          <Link href={editUrl}>
            <Button variant="outline" size="sm">
              Upravit
            </Button>
          </Link>
          <DeleteLessonButton lessonId={lessonId} lessonTitle={lessonTitle} />
        </div>
      )}
    </>
  )
}
