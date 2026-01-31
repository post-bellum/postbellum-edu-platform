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
  isAdmin?: boolean // Pass admin status from parent to avoid redundant API calls
}

export function AdminControls({ 
  lessonId, 
  lessonShortId,
  lessonTitle, 
  showNewButton = false,
  showEditButton = false,
  isAdmin: isAdminProp
}: AdminControlsProps) {
  // Use passed prop if available, otherwise fall back to hook (for standalone usage)
  const { isAdmin: isAdminFromHook, loading } = useIsAdmin()
  
  // If isAdmin is passed as prop, use it directly (no loading state needed)
  const isAdmin = isAdminProp !== undefined ? isAdminProp : isAdminFromHook
  const isLoading = isAdminProp !== undefined ? false : loading

  if (isLoading || !isAdmin) return null

  // Generate proper SEO-friendly edit URL using short_id if available
  const editUrl = lessonId && lessonTitle 
    ? `${generateLessonUrl(lessonShortId || lessonId, lessonTitle)}/edit`
    : null

  return (
    <>
      {showNewButton && (
        <div className="p-1.5 bg-grey-50/80 rounded-full border border-grey-200/80">
          <Link href="/lessons/new">
            <Button variant="ghost" size="sm" className="h-10 px-4 text-base gap-2 rounded-full">
              <Plus className="w-4 h-4" />
              Nová lekce
            </Button>
          </Link>
        </div>
      )}
      {showEditButton && editUrl && lessonId && lessonTitle && (
        <div className="flex items-center gap-1.5 p-1.5 bg-grey-50/80 rounded-full border border-grey-200/80">
          <Link href={editUrl}>
            <Button variant="ghost" size="sm" className="h-10 px-4 text-base gap-2 rounded-full">
              <Edit className="w-4 h-4" />
              Upravit lekci
            </Button>
          </Link>
          <div className="w-px h-5 bg-grey-200" />
          <DeleteLessonButton lessonId={lessonId} lessonTitle={lessonTitle} variant="compact-lg" />
        </div>
      )}
      {!showEditButton && editUrl && lessonId && lessonTitle && (
        <div className="flex items-center gap-1 p-1 bg-grey-50/80 rounded-full border border-grey-200/80">
          <Link href={editUrl}>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm gap-1.5 rounded-full">
              <Edit className="w-3.5 h-3.5" />
              Upravit
            </Button>
          </Link>
          <div className="w-px h-4 bg-grey-200" />
          <DeleteLessonButton 
            lessonId={lessonId} 
            lessonTitle={lessonTitle} 
            variant="compact"
          />
        </div>
      )}
    </>
  )
}
