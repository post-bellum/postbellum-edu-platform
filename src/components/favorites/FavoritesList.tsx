import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserFavoriteLessonIds } from '@/lib/supabase/favorites'
import { getLessonsByIds } from '@/lib/supabase/lessons'
import { Button } from '@/components/ui/Button'
import { Heart } from 'lucide-react'

export async function FavoritesList() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  const favoriteLessonIds = await getUserFavoriteLessonIds()
  
  if (favoriteLessonIds.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-lg">
        <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">Zatím nemáte žádné oblíbené lekce</p>
        <Link href="/lessons">
          <Button>Procházet katalog</Button>
        </Link>
      </div>
    )
  }

  // Fetch full lesson data for favorite IDs
  const favoriteLessons = await getLessonsByIds(favoriteLessonIds)

  if (favoriteLessons.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-lg">
        <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 mb-4">Zatím nemáte žádné oblíbené lekce</p>
        <Link href="/lessons">
          <Button>Procházet katalog</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {favoriteLessons.map((lesson) => (
        <div
          key={lesson.id}
          className="p-6 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
        >
          <Link href={`/lessons/${lesson.id}`} className="block">
            <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
            {lesson.description && (
              <p className="text-gray-600 mb-2 line-clamp-2">{lesson.description}</p>
            )}
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              {lesson.period && <span>{lesson.period}</span>}
              {lesson.duration && <span>• {lesson.duration}</span>}
              {lesson.target_group && <span>• {lesson.target_group}</span>}
              {lesson.publication_date && (
                <span>• Publikováno: {new Date(lesson.publication_date).toLocaleDateString('cs-CZ')}</span>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}

