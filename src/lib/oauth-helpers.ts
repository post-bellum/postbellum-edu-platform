type OAuthProvider = "google" | "microsoft"

export async function handleOAuthLogin(provider: OAuthProvider) {
  try {
    // TODO: Implement Supabase OAuth
    console.log(`OAuth login with ${provider}`)
    
    // Example implementation:
    // const supabase = createClient()
    // await supabase.auth.signInWithOAuth({
    //   provider: provider === 'google' ? 'google' : 'azure',
    //   options: {
    //     redirectTo: `${window.location.origin}/auth/callback`
    //   }
    // })
  } catch (error) {
    console.error(`OAuth login error (${provider}):`, error)
    throw error
  }
}


