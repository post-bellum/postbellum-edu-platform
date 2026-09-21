import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { AdminPageContent } from '@/components/admin/AdminPageContent'

// Uses cookies for auth - must be dynamically rendered
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Server-side admin check - redirects before page renders
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }

  return <AdminPageContent />
}
