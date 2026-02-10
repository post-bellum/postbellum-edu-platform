import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserFavoriteLessonIds } from '@/lib/supabase/favorites'
import { getLessonsByIds } from '@/lib/supabase/lessons'
import { LessonCard } from '@/components/lessons/LessonCard'
import { Button } from '@/components/ui/Button'
import { Bookmark } from 'lucide-react'

export async function FavoritesList() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  const favoriteLessonIds = await getUserFavoriteLessonIds()
  
  if (favoriteLessonIds.length === 0) {
    return (
      <div className="text-center py-24 border border-grey-200 rounded-3xl bg-grey-50/50">
        <Bookmark className="mx-auto h-12 w-12 text-text-subtle mb-4" />
        <p className="text-text-subtle mb-6 text-lg">Zatím nemáte žádné oblíbené lekce</p>
        <Link href="/lessons">
          <Button>Procházet katalog</Button>
        </Link>
      </div>
    )
  }

  // Fetch full lesson data for favorite IDs with tags
  const favoriteLessons = await getLessonsByIds(favoriteLessonIds, { include_tags: true })

  if (favoriteLessons.length === 0) {
    return (
      <div className="text-center py-24 border border-grey-200 rounded-3xl bg-grey-50/50">
        <Bookmark className="mx-auto h-12 w-12 text-text-subtle mb-4" />
        <p className="text-text-subtle mb-6 text-lg">Zatím nemáte žádné oblíbené lekce</p>
        <Link href="/lessons">
          <Button>Procházet katalog</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-10">
      {favoriteLessons.map((lesson) => (
        <LessonCard 
          key={lesson.id} 
          lesson={lesson} 
          showAdminControls={false}
        />
      ))}
    </div>
  )
}
