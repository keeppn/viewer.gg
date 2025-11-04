'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { initialize } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The session is established by the onAuthStateChange listener in authStore.
        // We just need to wait for the initialization to complete.
        console.log('AuthCallbackPage: Waiting for auth to initialize...')
        
        await initialize()
        
        console.log('AuthCallbackPage: Initialization complete, redirecting to dashboard.')
        router.push('/dashboard')

      } catch (error) {
        console.error('AuthCallbackPage: Unexpected error during callback handling:', error)
        router.push('/?error=Authentication failed')
      }
    }

    handleCallback()
  }, [router, initialize])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
