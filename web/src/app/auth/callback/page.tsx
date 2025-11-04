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
          
          // ✅ Removed duplicate user creation logic
          // User creation is now handled exclusively in authStore.initialize()
          // This prevents race conditions and ensures proper organization setup
          
          // Redirect to dashboard where authStore will handle user creation if needed
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
