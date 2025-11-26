"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Plus, Edit } from 'lucide-react'
import { DeleteLessonButton } from '@/components/lessons/DeleteLessonButton'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { useEffect, useState } from 'react'

interface AdminControlsProps {
  lessonId?: string
  lessonTitle?: string
  showNewButton?: boolean
  showEditButton?: boolean // Show edit button for lesson detail page
}

export function AdminControls({ 
  lessonId, 
  lessonTitle, 
  showNewButton = false,
  showEditButton = false 
}: AdminControlsProps) {
  const { isLoggedIn } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (!isLoggedIn) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/admin/check')
        const data = await response.json()
        setIsAdmin(data.isAdmin || false)
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [isLoggedIn])

  if (loading || !isAdmin) return null

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
      {showEditButton && lessonId && lessonTitle && (
        <div className="flex gap-2">
          <Link href={`/lessons/${lessonId}/edit`}>
            <Button>
              <Edit />
              Upravit lekci
            </Button>
          </Link>
          <DeleteLessonButton lessonId={lessonId} lessonTitle={lessonTitle} />
        </div>
      )}
      {!showEditButton && lessonId && lessonTitle && (
        <div className="flex gap-2">
          <Link href={`/lessons/${lessonId}/edit`}>
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

