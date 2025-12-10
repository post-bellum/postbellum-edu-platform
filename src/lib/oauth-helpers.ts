import { createClient } from '@/lib/supabase/client'
import type { Provider } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

type OAuthProvider = 'google' | 'microsoft'

// Map our provider names to Supabase provider names
const PROVIDER_MAP: Record<OAuthProvider, Provider> = {
  google: 'google',
  microsoft: 'azure',
} as const

interface OAuthOptions {
  returnTo?: string
}

export async function handleOAuthLogin(provider: OAuthProvider, options?: OAuthOptions) {
  try {
    const supabase = createClient()
    const supabaseProvider = PROVIDER_MAP[provider]
    
    // Build callback URL with optional returnTo parameter
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (options?.returnTo) {
      callbackUrl.searchParams.set('returnTo', options.returnTo)
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: {
        redirectTo: callbackUrl.toString(),
        skipBrowserRedirect: false,
        // Azure-specific scopes
        scopes: provider === 'microsoft' ? 'email profile openid' : undefined,
      }
    })

    if (error) {
      logger.error(`OAuth login error (${provider})`, error)
      throw error
    }

    return data
  } catch (error) {
    // Only log if it's not a Supabase error (already logged above)
    if (error && typeof error === 'object' && !('message' in error)) {
      logger.error(`OAuth login unexpected error (${provider})`, error)
    }
    throw error
  }
}

// Re-export client auth helpers for convenience
export { logout, getCurrentUser, isLoggedIn } from '@/lib/supabase/auth-helpers-client'


