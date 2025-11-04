'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the PKCE code exchange
        // by reading the code_verifier from localStorage
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push(`/?error=${encodeURIComponent(error.message)}`)
          return
        }

        if (session) {
          console.log('Session established:', session.user.email)
          
          // Check if user profile exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single()

          // Create user profile if doesn't exist
          if (!existingUser) {
            const provider = session.user.app_metadata?.provider || 'unknown'
            await supabase.from('users').insert({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email!.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url || 
                         session.user.user_metadata?.picture || 
                         null,
              oauth_provider: provider,
              user_type: 'organizer',
              role: 'admin',
              organization_id: null,
            })
          }

          // Redirect to dashboard
          router.push('/dashboard')
        } else {
          router.push('/?error=No session')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/?error=Authentication failed')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
