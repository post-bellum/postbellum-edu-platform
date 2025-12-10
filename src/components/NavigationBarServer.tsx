import { NavigationBar } from './NavigationBar'
import { createClient } from '@/lib/supabase/server'
import { getFavoriteCount } from '@/lib/supabase/favorites'

export async function NavigationBarServer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let favoriteCount = 0
  let userEmail: string | null = null

  if (user) {
    userEmail = user.email || null
    favoriteCount = await getFavoriteCount()
  }

  return <NavigationBar favoriteCount={favoriteCount} userEmail={userEmail} />
}

