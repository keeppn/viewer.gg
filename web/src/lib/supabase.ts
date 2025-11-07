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
    flowType: 'pkce', // Force PKCE flow instead of implicit flow
  },
});

// --- Auth helpers (client-side) ---

/**
 * Start an OAuth sign-in flow for Tournament Organizers
 * Only supports Google and Discord
 * @param provider - OAuth provider ('google' or 'discord')
 * @param userType - Always 'organizer' for tournament organizers
 */
export async function signInWithProvider(
  provider: "google" | "discord",
  userType: 'organizer'
) {
  // Store user type in localStorage temporarily for the callback
  localStorage.setItem('pending_user_type', userType);
  localStorage.setItem('pending_oauth_provider', provider);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: false,
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

/**
 * Sign up with email and password
 * @param email - User email
 * @param password - User password
 * @param fullName - User's full name (optional)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: 'organizer',
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with email and password
 * @param email - User email
 * @param password - User password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Send password reset email
 * @param email - User email
 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
  return data;
}
