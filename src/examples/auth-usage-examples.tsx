/**
 * AUTH USAGE EXAMPLES
 * 
 * This file shows different ways to check if a user is logged in
 * and how to logout in various scenarios.
 */

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/supabase/hooks/useAuth"
import { logout, getCurrentUser, isLoggedIn } from "@/lib/oauth-helpers"
import { Button } from "@/components/ui/Button"
import type { User } from "@supabase/supabase-js"

// ============================================================================
// EXAMPLE 1: Using the useAuth hook (RECOMMENDED for React components)
// ============================================================================

export function UserProfileWithHook() {
  const { user, loading, isLoggedIn } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isLoggedIn) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h2>Welcome, {user?.email}</h2>
      <p>User ID: {user?.id}</p>
      <Button onClick={logout}>Logout</Button>
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: Using async functions directly
// ============================================================================

export function UserProfileWithAsyncCheck() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    checkAuth()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>

  return (
    <div>
      <h2>Hello, {user.email}</h2>
      <Button onClick={logout}>Logout</Button>
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Simple login status check
// ============================================================================

export function LoginStatus() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      const status = await isLoggedIn()
      setLoggedIn(status)
    }
    checkStatus()
  }, [])

  return (
    <div>
      {loggedIn ? (
        <>
          <span>✓ Logged in</span>
          <Button onClick={logout}>Logout</Button>
        </>
      ) : (
        <span>Not logged in</span>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Logout button component
// ============================================================================

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      // User will be redirected to home page automatically
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  )
}

// ============================================================================
// EXAMPLE 5: Protected content that shows only when logged in
// ============================================================================

export function ProtectedContent() {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isLoggedIn) {
    return null // Or redirect to login page
  }

  return (
    <div>
      <h1>Secret Content</h1>
      <p>This is only visible to logged-in users</p>
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: Get user info on button click
// ============================================================================

export function GetUserInfoButton() {
  const [userInfo, setUserInfo] = useState<string>("")

  const handleGetInfo = async () => {
    const user = await getCurrentUser()
    if (user) {
      setUserInfo(`Email: ${user.email}, ID: ${user.id}`)
    } else {
      setUserInfo("Not logged in")
    }
  }

  return (
    <div>
      <Button onClick={handleGetInfo}>Get User Info</Button>
      {userInfo && <p>{userInfo}</p>}
    </div>
  )
}

