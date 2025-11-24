# Critical Fixes Required Before Merge

## 🔴 Must Fix Immediately

### 1. Remove Sensitive Data from Logs

**File:** `src/app/auth/callback/route.ts`

**Current:**
```typescript
console.log("OAuth success! User:", data.user?.email) // ⚠️ REMOVE
```

**Fix:**
```typescript
logger.info("OAuth authentication successful")
// Or remove entirely if not needed
```

---

### 2. Standardize Logging

**Files:** All files using `console.error()`, `console.log()`, `console.warn()`

**Action:** Replace all `console.*` calls with `logger.*` from `@/lib/logger`

**Example:**
```typescript
// Before
console.error("Error:", error)

// After
import { logger } from "@/lib/logger"
logger.error("Error:", error)
```

**Files to update:**
- `src/app/auth/callback/route.ts`
- `src/lib/supabase/email-auth.ts`
- `src/lib/supabase/user-profile.ts`
- `src/lib/supabase/user-helpers.ts`
- `src/lib/supabase/schools.ts`
- `src/lib/supabase/auth-helpers.ts`
- `src/lib/supabase/auth-helpers-client.ts`
- `src/lib/oauth-helpers.ts`
- `src/components/auth/*.tsx`
- `src/app/profile/page.tsx`
- `src/app/actions/delete-account.ts`

---

### 3. Fix Race Condition in Registration Check

**File:** `src/app/page.tsx`

**Current Issue:** Multiple async operations without proper cancellation

**Fix:** Use AbortController

```typescript
useEffect(() => {
  const abortController = new AbortController()
  
  async function checkRegistration() {
    if (isLoggedIn && !loading) {
      try {
        const completed = await hasCompletedRegistration()
        
        if (abortController.signal.aborted) return
        
        if (!completed) {
          setShowCompleteRegistration(true)
        } else {
          const profile = await getUserProfile()
          
          if (abortController.signal.aborted) return
          
          setUserProfile(profile)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          logger.error("Error checking registration:", error)
        }
      }
    }
  }
  
  checkRegistration()
  
  return () => {
    abortController.abort()
  }
}, [isLoggedIn, loading])
```

---

### 4. Fix Duplicate Error Logging in OAuth

**File:** `src/lib/oauth-helpers.ts`

**Current:**
```typescript
if (error) {
  console.error(`OAuth login error (${provider}):`, error)
  throw error
}
return data
} catch (error) {
  console.error(`OAuth login error (${provider}):`, error) // ⚠️ Duplicate
  throw error
}
```

**Fix:**
```typescript
import { logger } from "@/lib/logger"

export async function handleOAuthLogin(provider: OAuthProvider) {
  try {
    const supabase = createClient()
    const supabaseProvider = PROVIDER_MAP[provider]
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
        scopes: provider === 'microsoft' ? 'email profile openid' : undefined,
      }
    })

    if (error) {
      logger.error(`OAuth login error (${provider}):`, error)
      throw error
    }

    return data
  } catch (error) {
    // Only log if it's not a Supabase error (already logged above)
    if (error && typeof error === 'object' && !('message' in error)) {
      logger.error(`OAuth login unexpected error (${provider}):`, error)
    }
    throw error
  }
}
```

**Also update:** `src/components/auth/OAuthButtons.tsx` to handle errors:

```typescript
const onOAuthClick = async (provider: "google" | "microsoft") => {
  setIsLoading(true)
  try {
    await handleOAuthLogin(provider)
  } catch (error) {
    // Show user-friendly error message
    logger.error(`OAuth login failed (${provider}):`, error)
    // TODO: Show toast/error message to user
  } finally {
    setIsLoading(false)
  }
}
```

---

### 5. Improve Input Sanitization

**File:** `src/lib/sanitize.ts`

**Current:** Basic regex-based sanitization

**Immediate Fix:** Add better validation

```typescript
export function sanitizeInput(input: string): string {
  if (!input) return input
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '')
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  
  // Remove script-like patterns (improved)
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
  
  // Decode HTML entities and re-encode to prevent double encoding attacks
  // Note: For production, consider using DOMPurify library
  sanitized = sanitized
    .replace(/&#x[\da-f]+;/gi, '')
    .replace(/&#\d+;/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}
```

**Better Long-term Solution:** Use `DOMPurify` library

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```typescript
import DOMPurify from 'dompurify'

export function sanitizeInput(input: string): string {
  if (!input) return input
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}
```

---

## 🟡 Should Fix Soon

### 6. Add Error Handling for Database Constraints

**File:** `src/lib/supabase/user-profile.ts`

**Add:**
```typescript
export async function completeRegistration(data: CompleteRegistrationData): Promise<void> {
  try {
    // ... existing validation ...
    
    const { error } = await supabase
      .from('profiles')
      .upsert({...}, { onConflict: 'id' })
    
    if (error) {
      // Handle constraint violations specifically
      if (error.code === '23514') { // Check constraint violation
        logger.error("Database constraint violation:", error)
        throw new Error("Neplatná kombinace údajů. Zkontrolujte prosím vyplněné údaje.")
      }
      
      logger.error("Error saving profile:", error)
      throw error
    }
  } catch (error) {
    logger.error("Error completing registration:", error)
    throw error
  }
}
```

---

### 7. Fix Type Safety

**File:** `src/app/page.tsx`

**Replace:**
```typescript
const [userProfile, setUserProfile] = useState<{
  userType?: string;
  schoolName?: string | null;
  category?: string | null;
} | null>(null);
```

**With:**
```typescript
import type { UserProfile } from "@/types/user.types"

const [userProfile, setUserProfile] = useState<Pick<UserProfile, 'user_type' | 'school_name' | 'category'> | null>(null);
```

---

## ✅ Quick Wins

1. **Add ESLint rule to prevent console usage:**
   ```json
   // eslint.config.mjs
   rules: {
     "no-console": ["warn", { allow: ["warn", "error"] }]
   }
   ```

2. **Add error boundary for auth components**

3. **Add loading states for all async operations**

---

## Testing Checklist

After fixes, test:
- [ ] OAuth flow with errors
- [ ] Registration with invalid data
- [ ] Rapid form submissions (rate limiting)
- [ ] Component unmounting during async operations
- [ ] Logs don't contain sensitive data
- [ ] All console.* calls replaced with logger.*

---

*See CODE_REVIEW.md for full detailed review*

