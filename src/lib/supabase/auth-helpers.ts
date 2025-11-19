import { createClient } from "./server";
import { redirect } from "next/navigation";
import { authConfig } from "./config";
import { cache } from "react";

// Cache the user data for the duration of the request
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }

  return user;
});

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error.message);
    return null;
  }

  return session;
});

export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    redirect(authConfig.redirects.login);
  }
  
  return user;
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error signing out:", error.message);
    throw new Error("Failed to sign out");
  }
  
  redirect(authConfig.redirects.afterLogout);
}
