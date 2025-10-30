"use client";

import { createClient } from "@supabase/supabase-js";

// Next.js client-visible envs must start with NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase initialization:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase envs. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// --- Auth helpers (client-side) ---

/**
 * Start an OAuth sign-in flow with the given provider and user type.
 * @param provider - OAuth provider (twitch, youtube, kick, google, discord)
 * @param userType - 'organizer' or 'streamer' (null for login)
 */
export async function signInWithProvider(
  provider: "twitch" | "youtube" | "kick" | "google" | "discord",
  userType?: 'organizer' | 'streamer' | null
) {
  // Store user type in localStorage temporarily for the callback
  if (userType) {
    localStorage.setItem('pending_user_type', userType);
    localStorage.setItem('pending_oauth_provider', provider);
  }
  
  const { data, error} = await supabase.auth.signInWithOAuth({
    provider: provider as any, // YouTube and Kick will be handled via custom OAuth
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: provider === 'youtube' ? 'https://www.googleapis.com/auth/youtube.readonly' : undefined,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
