/**
 * Application-wide constants
 */

// Authentication
export const AUTH_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  DISPLAY_NAME_MAX_LENGTH: 32,
  DELETE_ACCOUNT_CONFIRMATION: 'ODSTRANIT',
} as const

// OAuth Error Messages (Czech translations)
export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Přístup byl zamítnut. Zkuste to prosím znovu.',
  server_error: 'Chyba serveru. Zkuste to prosím později.',
  temporarily_unavailable: 'Služba je dočasně nedostupná. Zkuste to prosím později.',
  invalid_request: 'Neplatný požadavek. Zkuste to prosím znovu.',
  unauthorized_client: 'Neautorizovaný klient. Kontaktujte prosím podporu.',
  unsupported_response_type: 'Nepodporovaný typ odpovědi.',
  invalid_scope: 'Neplatný rozsah oprávnění.',
  auth_failed: 'Autentizace selhala. Zkuste to prosím znovu.',
}

// Category Labels (Czech)
export const CATEGORY_LABELS: Record<string, string> = {
  student: 'student/ka',
  parent: 'rodič',
  educational_professional: 'odborná veřejnost ve vzdělávání (metodik/metodička, konzultant/ka, ...)',
  ngo_worker: 'pracovník/pracovnice v neziskovém a nevládním sektoru',
  public_sector_worker: 'pracovník/pracovnice ve státním sektoru',
  other: 'ostatní',
} as const

// User Types
export const USER_TYPES = {
  TEACHER: 'teacher',
  NOT_TEACHER: 'not-teacher',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  AUTH_CALLBACK: '/auth/callback',
  RESET_PASSWORD: '/auth/reset-password',
} as const

