'use server'

import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/admin-helpers'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

/**
 * Where the user is in the sign-up flow:
 * - `unconfirmed`: signed up with e-mail + password, never clicked the confirmation link
 * - `incomplete`: can sign in, but has not finished the "complete registration"
 *   step, so there is no (completed) row in `profiles`
 * - `completed`: profile filled in (user type, school/category, terms)
 */
export type RegistrationStatus = 'unconfirmed' | 'incomplete' | 'completed'

export interface RegisteredUser {
  id: string
  email: string | null
  displayName: string | null
  /** Sign-in methods: 'email', 'google', 'azure', ... */
  providers: string[]
  status: RegistrationStatus
  userType: ProfileRow['user_type'] | null
  schoolName: string | null
  category: string | null
  emailConsent: boolean | null
  isAdmin: boolean
  createdAt: string
  emailConfirmedAt: string | null
  lastSignInAt: string | null
}

export interface RegisteredUsersStats {
  total: number
  completed: number
  incomplete: number
  unconfirmed: number
  teachers: number
}

/** Supabase caps a listUsers page at 1000. */
const AUTH_PAGE_SIZE = 1000

async function listAllAuthUsers(supabase: ReturnType<typeof createAdminClient>): Promise<User[]> {
  const users: User[] = []
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: AUTH_PAGE_SIZE })
    if (error) throw error
    users.push(...data.users)
    if (data.users.length < AUTH_PAGE_SIZE) break
  }
  return users
}

function getProviders(user: User): string[] {
  const fromIdentities = user.identities?.map(identity => identity.provider) ?? []
  const fromMetadata = (user.app_metadata?.providers as string[] | undefined) ?? []
  return Array.from(new Set([...fromIdentities, ...fromMetadata]))
}

function getStatus(user: User, profile: ProfileRow | undefined): RegistrationStatus {
  if (profile?.registration_completed) return 'completed'
  if (!user.email_confirmed_at) return 'unconfirmed'
  return 'incomplete'
}

export async function getRegisteredUsers(): Promise<{
  success: boolean
  data?: RegisteredUser[]
  stats?: RegisteredUsersStats
  error?: string
}> {
  try {
    await requireAdmin()

    const supabase = createAdminClient()

    const [authUsers, profilesResult] = await Promise.all([
      listAllAuthUsers(supabase),
      supabase.from('profiles').select('*'),
    ])

    if (profilesResult.error) {
      logger.error('Error fetching profiles', profilesResult.error)
      return { success: false, error: 'Nepodařilo se načíst profily uživatelů' }
    }

    const profilesById = new Map((profilesResult.data ?? []).map(p => [p.id, p]))

    const users: RegisteredUser[] = authUsers
      .map(user => {
        const profile = profilesById.get(user.id)
        return {
          id: user.id,
          email: user.email ?? profile?.email ?? null,
          displayName:
            profile?.display_name ??
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            null,
          providers: getProviders(user),
          status: getStatus(user, profile),
          userType: profile?.user_type ?? null,
          schoolName: profile?.school_name ?? null,
          category: profile?.category ?? null,
          emailConsent: profile?.email_consent ?? null,
          isAdmin: profile?.is_admin ?? false,
          createdAt: user.created_at,
          emailConfirmedAt: user.email_confirmed_at ?? null,
          lastSignInAt: user.last_sign_in_at ?? null,
        }
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const stats: RegisteredUsersStats = {
      total: users.length,
      completed: users.filter(u => u.status === 'completed').length,
      incomplete: users.filter(u => u.status === 'incomplete').length,
      unconfirmed: users.filter(u => u.status === 'unconfirmed').length,
      teachers: users.filter(u => u.userType === 'teacher').length,
    }

    return { success: true, data: users, stats }
  } catch (error) {
    logger.error('Error fetching registered users', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba při načítání uživatelů',
    }
  }
}
