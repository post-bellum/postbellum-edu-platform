import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/admin-helpers'
import { AdminPageContent } from '@/components/admin/AdminPageContent'

export default async function AdminPage() {
  // Server-side admin check - redirects before page renders
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }

  return <AdminPageContent />
}
