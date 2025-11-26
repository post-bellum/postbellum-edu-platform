import { isAdmin } from '@/lib/supabase/admin-helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = await isAdmin()
  return NextResponse.json({ isAdmin: admin })
}

