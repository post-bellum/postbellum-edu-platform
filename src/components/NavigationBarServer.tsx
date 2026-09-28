import { NavigationBar } from './NavigationBar'
import { getUser } from '@/lib/supabase/auth-helpers'
import { getFavoriteCount } from '@/lib/supabase/favorites'

export async function NavigationBarServer() {
  const user = await getUser()
  
  let favoriteCount = 0
  let userEmail: string | null = null

  if (user) {
    userEmail = user.email || null
    favoriteCount = await getFavoriteCount()
  }

  return <NavigationBar favoriteCount={favoriteCount} userEmail={userEmail} />
}

