# Authentication Quick Reference

## How to Check if User is Logged In

### Method 1: Using the `useAuth` Hook (Recommended for React Components)

```tsx
import { useAuth } from "@/lib/supabase/hooks/useAuth"

function MyComponent() {
  const { user, loading, isLoggedIn } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isLoggedIn) return <div>Please log in</div>

  return <div>Welcome, {user.email}!</div>
}
```

**Returns:**
- `user`: User object or null
- `loading`: Boolean indicating if auth state is loading
- `isLoggedIn`: Boolean (true if user is logged in)

**Benefits:** Automatically updates when auth state changes!

---

### Method 2: Using Direct Functions

```tsx
import { getCurrentUser, isLoggedIn } from "@/lib/oauth-helpers"

// Get full user object
const user = await getCurrentUser()
if (user) {
  console.log("Logged in as:", user.email)
}

// Just check if logged in
const loggedIn = await isLoggedIn()
if (loggedIn) {
  console.log("User is logged in!")
}
```

---

## How to Logout

```tsx
import { logout } from "@/lib/oauth-helpers"

// Simple logout
await logout()
// User will be automatically redirected to home page
```

### Logout Button Example

```tsx
import { logout } from "@/lib/oauth-helpers"
import { Button } from "@/components/ui/Button"

function LogoutButton() {
  return <Button onClick={logout}>Logout</Button>
}
```

---

## How to Login with Google

Your `OAuthButtons` component already handles this! Users just click the Google button.

```tsx
import { OAuthButtons } from "@/components/auth/OAuthButtons"

function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <OAuthButtons />
    </div>
  )
}
```

---

## Complete Example: Protected Page

```tsx
"use client"

import { useAuth } from "@/lib/supabase/hooks/useAuth"
import { logout } from "@/lib/oauth-helpers"
import { Button } from "@/components/ui/Button"

export default function DashboardPage() {
  const { user, loading, isLoggedIn } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isLoggedIn) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>Please log in to view this page</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.email}!</p>
      <Button onClick={logout}>Logout</Button>
    </div>
  )
}
```

---

## Available Functions

### Client-Side (Browser)

```tsx
// React hook for auth state
import { useAuth } from "@/lib/supabase/hooks/useAuth"

// Auth functions (login, logout, etc)
import { 
  logout,            // Sign out
  getCurrentUser,    // Get current user object
  getCurrentSession, // Get current session
  isLoggedIn,        // Check if logged in
} from "@/lib/oauth-helpers"
```

### Server-Side (Server Components, API Routes)

```tsx
import { 
  getUser,      // Get user on server
  getSession,   // Get session on server
  requireAuth,  // Get user or redirect to login
  signOut       // Sign out on server
} from "@/lib/supabase/auth-helpers"
```

---

## After OAuth Login

After a successful Google login:
1. User is redirected to `/auth/callback`
2. Session is automatically created
3. User is redirected to home page
4. `useAuth()` hook automatically detects the new session
5. All components using `useAuth()` will re-render with user data

---

## Tips

✅ **DO**: Use `useAuth()` hook in React components for automatic updates
✅ **DO**: Use server-side helpers (`getUser`, `requireAuth`) in Server Components
✅ **DO**: Handle loading states in your UI
❌ **DON'T**: Mix server and client auth helpers in the same file
❌ **DON'T**: Forget to check the `loading` state before showing content

