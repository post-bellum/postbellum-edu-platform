import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("OAuth callback error:", error)
      // Redirect to home page with error (you can add error handling UI later)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
  }

  // Redirect to home page
  // The home page will automatically check if the user needs to complete registration
  return NextResponse.redirect(`${origin}/`)
}


