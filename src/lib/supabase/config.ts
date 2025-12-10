// Client-safe configuration (can be imported anywhere)
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

// Server-only configuration
export const supabaseServerConfig = {
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

// Auth configuration
export const authConfig = {
  redirects: {
    login: '/auth/login',
    afterLogin: '/dashboard',
    afterLogout: '/',
    afterSignup: '/onboarding',
  },
  protectedPaths: ['/dashboard', '/lessons/edit', '/profile'],
} as const;
