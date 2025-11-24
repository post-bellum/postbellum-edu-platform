import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const origin = requestUrl.origin

  // Check for OAuth provider errors
  if (error) {
    logger.error("OAuth provider error", { error, errorDescription })
    return NextResponse.redirect(`${origin}/?error=${error}&description=${encodeURIComponent(errorDescription || '')}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      logger.error("OAuth callback error", exchangeError)
      return NextResponse.redirect(`${origin}/?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`)
    }

    logger.info("OAuth authentication successful")
  }

  // Redirect to home page
  // The home page will automatically check if the user needs to complete registration
  return NextResponse.redirect(`${origin}/`)
}


