import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
    )
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    )

    try {
      // Exchange the code for a session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error('Session exchange error:', sessionError)
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent(sessionError.message)}`, requestUrl.origin)
        )
      }

      if (!sessionData.session) {
        console.error('No session returned after code exchange')
        return NextResponse.redirect(
          new URL('/?error=No session created', requestUrl.origin)
        )
      }

      const user = sessionData.user
      const provider = user.app_metadata?.provider || 'unknown'

      console.log('Auth callback - User authenticated:', {
        userId: user.id,
        email: user.email,
        provider: provider,
      })

      // Check if user profile exists in our users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, organization_id')
        .eq('id', user.id)
        .single()

      if (userCheckError && userCheckError.code !== 'PGRST116') {
        // PGRST116 = not found, which is okay
        console.error('Error checking user:', userCheckError)
      }

      // If user doesn't exist, create user profile (organization will be created later)
      if (!existingUser) {
        console.log('Creating new user profile for:', user.email)

        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          oauth_provider: provider,
          user_type: 'organizer',
          role: 'admin',
          organization_id: null, // Will be set when organization is created
        })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
          // Continue anyway - user can still access the app
        } else {
          console.log('User profile created successfully')
        }
      } else {
        console.log('Existing user found:', existingUser.id)
      }

      // Redirect to dashboard using replace (no hash fragment)
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))

      // Set no-cache headers to prevent stale auth state
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      return response

    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent('Authentication failed')}`, requestUrl.origin)
      )
    }
  }

  // No code parameter
  console.error('No code parameter in callback URL')
  return NextResponse.redirect(new URL('/?error=Invalid callback', requestUrl.origin))
}
