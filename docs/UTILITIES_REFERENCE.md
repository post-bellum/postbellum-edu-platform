# Utilities Reference Guide

Quick reference for the new utility functions and constants added to the codebase.

---

## 📝 Logger (`src/lib/logger.ts`)

Centralized logging utility for consistent error tracking.

### Import
```typescript
import { logger } from '@/lib/logger'
```

### Methods

```typescript
// Error logging (always logged)
logger.error('Failed to save profile', error)

// Warning logging
logger.warn('User session expiring soon', { userId, expiresAt })

// Info logging
logger.info('User logged in successfully', { email })

// Debug logging (only in development)
logger.debug('Processing registration data', { userType, schoolName })
```

### Environment Behavior
- **Development**: All log levels shown in console
- **Production**: Debug logs skipped, ready for Sentry/LogRocket integration

### Future Integration
```typescript
// TODO: Add in logger.ts
if (level === 'error') {
  Sentry.captureException(data)
}
```

---

## 🔒 Sanitization (`src/lib/sanitize.ts`)

Lightweight input sanitization to prevent XSS attacks (no external dependencies).

### Import
```typescript
import { sanitizeInput, sanitizeInputs } from '@/lib/sanitize'
```

### Single Input
```typescript
const cleanName = sanitizeInput(userInput)
// Strips HTML tags and dangerous JavaScript patterns
// Input:  "<script>alert('xss')</script>John"
// Output: "John"

// Input:  "Hello <b>World</b>"
// Output: "Hello World"
```

### Multiple Inputs
```typescript
const cleaned = sanitizeInputs({
  displayName: formData.displayName,
  schoolName: formData.schoolName,
  bio: formData.bio,
})
// Returns: { displayName: "...", schoolName: "...", bio: "..." }
```

### What Gets Removed
- HTML tags (`<script>`, `<img>`, `<div>`, etc.)
- JavaScript patterns (`javascript:`, `onclick=`, `onerror=`, etc.)
- Leading/trailing whitespace (trimmed)
- Text content is preserved

### What's NOT Removed
- Special characters (é, ñ, ü, etc.)
- Numbers and punctuation
- Emojis
- Regular text

### Usage in Forms
```typescript
const handleSubmit = async (data: FormData) => {
  const sanitized = sanitizeInput(data.displayName)
  await updateProfile({ displayName: sanitized })
}
```

### Implementation
```typescript
// Simple regex-based sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')        // Remove HTML tags
    .replace(/javascript:/gi, '')    // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '')      // Remove event handlers
    .trim()                          // Remove whitespace
}
```

---

## 🖼️ Gravatar (`src/lib/gravatar.ts`)

Generate Gravatar URLs with proper MD5 hashing.

### Import
```typescript
import { getGravatarUrl, hasGravatar } from '@/lib/gravatar'
```

### Generate Gravatar URL
```typescript
const avatarUrl = getGravatarUrl(email, size?, defaultImage?)
```

**Parameters**:
- `email` (string): User's email address
- `size` (number, optional): Avatar size in pixels (default: 80)
- `defaultImage` (string, optional): Default if no Gravatar exists
  - `'identicon'` - Geometric pattern (default)
  - `'mp'` - Mystery person silhouette
  - `'retro'` - 8-bit arcade style
  - `'robohash'` - Robot face
  - `'wavatar'` - Cartoon face

**Examples**:
```typescript
// Basic usage (80px, identicon default)
const url = getGravatarUrl('user@example.com')

// Custom size
const largeAvatar = getGravatarUrl('user@example.com', 200)

// Custom default image
const robotAvatar = getGravatarUrl('user@example.com', 120, 'robohash')
```

### Check if User Has Gravatar
```typescript
const hasAvatar = await hasGravatar('user@example.com')
if (hasAvatar) {
  // User has a Gravatar account
}
```

### In React Components
```typescript
import { getGravatarUrl } from '@/lib/gravatar'

function Avatar({ email }: { email: string }) {
  return (
    <img 
      src={getGravatarUrl(email, 80, 'identicon')}
      alt="User avatar"
      className="rounded-full"
    />
  )
}
```

---

## 🔢 Constants (`src/lib/constants.ts`)

Application-wide constants for consistency.

### Import
```typescript
import { 
  AUTH_CONSTANTS, 
  OAUTH_ERROR_MESSAGES, 
  CATEGORY_LABELS,
  USER_TYPES,
  ROUTES 
} from '@/lib/constants'
```

### Authentication Constants
```typescript
AUTH_CONSTANTS.PASSWORD_MIN_LENGTH         // 8
AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH     // 32
AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION // "ODSTRANIT"

// Usage
<Input 
  maxLength={AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH}
  placeholder="Your name"
/>

if (password.length < AUTH_CONSTANTS.PASSWORD_MIN_LENGTH) {
  setError(`Password must be at least ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
}
```

### OAuth Error Messages
```typescript
// Map error codes to Czech messages
const friendlyError = OAUTH_ERROR_MESSAGES[errorCode] || 'Unknown error'

// Available error codes:
OAUTH_ERROR_MESSAGES['access_denied']            // "Přístup byl zamítnut..."
OAUTH_ERROR_MESSAGES['server_error']             // "Chyba serveru..."
OAUTH_ERROR_MESSAGES['temporarily_unavailable']  // "Služba je dočasně nedostupná..."
```

### Category Labels
```typescript
// User category labels in Czech
CATEGORY_LABELS['student']                    // "student/ka"
CATEGORY_LABELS['parent']                     // "rodič"
CATEGORY_LABELS['educational_professional']   // "odborná veřejnost..."

// Usage
<Select>
  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
    <option key={value} value={value}>{label}</option>
  ))}
</Select>
```

### User Types
```typescript
USER_TYPES.TEACHER      // "teacher"
USER_TYPES.NOT_TEACHER  // "not-teacher"

// Usage
if (userType === USER_TYPES.TEACHER) {
  // Show school field
}
```

### Routes
```typescript
ROUTES.HOME             // "/"
ROUTES.PROFILE          // "/profile"
ROUTES.DASHBOARD        // "/dashboard"
ROUTES.AUTH_CALLBACK    // "/auth/callback"
ROUTES.RESET_PASSWORD   // "/auth/reset-password"

// Usage
router.push(ROUTES.PROFILE)
redirect(ROUTES.HOME)
```

---

## 🎯 Best Practices

### When to Use Logger
```typescript
// ✅ DO: Use for errors
logger.error('Failed to save', error)

// ✅ DO: Use for important events
logger.info('User completed registration', { userId })

// ❌ DON'T: Use for every function call
logger.debug('Function called') // Too verbose

// ❌ DON'T: Log sensitive data
logger.info('User logged in', { password }) // NEVER log passwords
```

### When to Sanitize
```typescript
// ✅ DO: Sanitize user inputs before storage
const clean = sanitizeInput(formData.name)
await saveToDatabase(clean)

// ✅ DO: Sanitize before displaying user content
<div>{sanitizeInput(userBio)}</div>

// ❌ DON'T: Sanitize data from trusted sources
const apiData = await fetch('/api/admin')
// No need to sanitize - trusted source

// ❌ DON'T: Double-sanitize
const clean1 = sanitizeInput(input)
const clean2 = sanitizeInput(clean1) // Unnecessary
```

### When to Use Constants
```typescript
// ✅ DO: Use constants for repeated values
if (name.length > AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH)

// ✅ DO: Use for validation
const errors = []
if (password.length < AUTH_CONSTANTS.PASSWORD_MIN_LENGTH) {
  errors.push(`Min ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} chars`)
}

// ❌ DON'T: Hard-code magic strings
if (deleteConfirm !== "ODSTRANIT") // Bad

// ✅ DO: Use constant
if (deleteConfirm !== AUTH_CONSTANTS.DELETE_ACCOUNT_CONFIRMATION) // Good
```

---

## 🔧 Integration Examples

### Complete Form Handler
```typescript
import { sanitizeInput } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { AUTH_CONSTANTS } from '@/lib/constants'

async function handleProfileUpdate(formData: FormData) {
  try {
    // Validate
    if (formData.displayName.length > AUTH_CONSTANTS.DISPLAY_NAME_MAX_LENGTH) {
      throw new Error('Display name too long')
    }
    
    // Sanitize
    const cleanData = {
      displayName: sanitizeInput(formData.displayName),
      schoolName: sanitizeInput(formData.schoolName),
    }
    
    // Save
    await updateProfile(cleanData)
    
    logger.info('Profile updated successfully', { userId: user.id })
  } catch (error) {
    logger.error('Profile update failed', error)
    throw error
  }
}
```

### Avatar Display Component
```typescript
import { getGravatarUrl } from '@/lib/gravatar'

export function UserAvatar({ email, size = 40 }: Props) {
  return (
    <img
      src={getGravatarUrl(email, size, 'identicon')}
      alt="Avatar"
      width={size}
      height={size}
      className="rounded-full"
    />
  )
}
```

### Error Display with Translation
```typescript
import { OAUTH_ERROR_MESSAGES } from '@/lib/constants'

function ErrorDisplay({ errorCode }: { errorCode: string }) {
  const message = OAUTH_ERROR_MESSAGES[errorCode] || 
    'Neznámá chyba. Zkuste to prosím znovu.'
    
  return <div className="error">{message}</div>
}
```

---

## 📚 Further Reading

- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Gravatar Image Requests](https://docs.gravatar.com/api/avatars/images/)
- [MD5 Package](https://www.npmjs.com/package/md5)
- [Input Sanitization Best Practices](https://owasp.org/www-community/controls/Input_Validation)

---

## 🆘 Troubleshooting

### Gravatar not loading
```typescript
// Check if email is valid
const url = getGravatarUrl(email)
console.log(url) // Should contain 32-char MD5 hash

// Test in browser
// https://www.gravatar.com/avatar/{hash}?s=80&d=identicon
```

### Sanitization removing too much
```typescript
// The sanitizer strips ALL HTML tags by default
// If you need to allow some HTML, modify src/lib/sanitize.ts:

export function sanitizeInput(input: string): string {
  // Option 1: Allow specific tags
  return input
    .replace(/<(?!\/?(?:b|i|em|strong)(?:\s|>))[^>]*>/gi, '') // Allow only b, i, em, strong
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
  
  // Option 2: Use a library like DOMPurify if you need more control
  // npm install isomorphic-dompurify
}
```

### Logger not working
```typescript
// Check if logger is imported correctly
import { logger } from '@/lib/logger' // ✅ Correct
import logger from '@/lib/logger'    // ❌ Wrong (not default export)

// Check environment
console.log(process.env.NODE_ENV) // Should be 'development' or 'production'
```

---

**Last Updated**: November 24, 2025

