import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error('Session exchange error:', sessionError);
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }

    if (!sessionData?.user) {
      return NextResponse.redirect(`${origin}/?error=no_user`);
    }

    // Return an HTML page that will handle user creation on the client side
    const callbackHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Completing sign up...</title>
          <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
          <meta http-equiv="Pragma" content="no-cache">
          <meta http-equiv="Expires" content="0">
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #0a0a0a 0%, #121212 50%, #1a1a1a 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            .container {
              text-align: center;
              color: white;
            }
            .spinner {
              width: 50px;
              height: 50px;
              border: 4px solid rgba(56, 123, 102, 0.3);
              border-top-color: #387B66;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            h2 { margin: 0 0 10px; font-size: 24px; }
            p { margin: 0; color: #888; }
            .error { color: #ff6b6b; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h2>Completing authentication...</h2>
            <p id="status">Please wait while we set up your account</p>
            <p class="error" id="error" style="display: none;"></p>
          </div>
          
          <script>
            (async function() {
              const statusEl = document.getElementById('status');
              const errorEl = document.getElementById('error');
              
              function showError(message) {
                errorEl.textContent = message;
                errorEl.style.display = 'block';
                statusEl.textContent = 'An error occurred';
              }
              
              try {
                // Get data from localStorage
                const userType = localStorage.getItem('pending_user_type');
                const oauthProvider = localStorage.getItem('pending_oauth_provider');
                
                // Get user data from auth
                const userId = '${sessionData.user.id}';
                const userEmail = '${sessionData.user.email || ''}';
                const userName = '${sessionData.user.user_metadata?.full_name || sessionData.user.user_metadata?.name || sessionData.user.email?.split('@')[0] || 'User'}';
                const avatarUrl = '${sessionData.user.user_metadata?.avatar_url || sessionData.user.user_metadata?.picture || ''}';
                
                console.log('Auth callback - User data:', {
                  userId,
                  userEmail,
                  userName,
                  userType,
                  oauthProvider,
                  hasAvatarUrl: !!avatarUrl
                });
                
                // Check if this is a new signup or existing login
                const supabaseUrl = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
                const supabaseKey = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
                const accessToken = '${sessionData.session?.access_token}';
                
                // First check if user already exists
                statusEl.textContent = 'Checking user account...';
                const checkResponse = await fetch(supabaseUrl + '/rest/v1/users?id=eq.' + userId, {
                  headers: {
                    'apikey': supabaseKey,
                    'Authorization': 'Bearer ' + accessToken
                  }
                });
                
                const existingUsers = await checkResponse.json();
                
                if (existingUsers && existingUsers.length > 0) {
                  console.log('Existing user found, logging in...');
                  statusEl.textContent = 'Welcome back!';
                  
                  // Clear temporary storage
                  localStorage.removeItem('pending_user_type');
                  localStorage.removeItem('pending_oauth_provider');
                  
                  // Redirect to dashboard
                  setTimeout(() => {
                    window.location.href = '${origin}/dashboard';
                  }, 500);
                  return;
                }
                
                // New user signup - create user record
                console.log('New user, creating record...');
                statusEl.textContent = 'Creating your account...';
                
                if (!userType || !oauthProvider) {
                  throw new Error('Missing signup information. Please try signing up again.');
                }
                
                // Determine role and streaming platform based on user type and provider
                let role = 'viewer';
                let streamingPlatform = null;
                
                if (userType === 'organizer') {
                  role = 'admin';
                } else if (userType === 'streamer') {
                  role = 'viewer';
                  // Set streaming platform based on OAuth provider
                  const platformMap = {
                    'twitch': 'Twitch',
                    'youtube': 'YouTube',
                    'kick': 'Kick'
                  };
                  streamingPlatform = platformMap[oauthProvider] || null;
                }
                
                // Create user record
                const userData = {
                  id: userId,
                  email: userEmail,
                  name: userName,
                  avatar_url: avatarUrl || null,
                  user_type: userType,
                  oauth_provider: oauthProvider,
                  role: role,
                  streaming_platform: streamingPlatform,
                  organization_id: null
                };
                
                console.log('Creating user with data:', userData);
                
                const createResponse = await fetch(supabaseUrl + '/rest/v1/users', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': 'Bearer ' + accessToken,
                    'Prefer': 'resolution=merge-duplicates,return=representation'
                  },
                  body: JSON.stringify(userData)
                });
                
                if (!createResponse.ok) {
                  const errorText = await createResponse.text();
                  console.error('Failed to create user:', errorText);
                  throw new Error('Failed to create user account: ' + errorText);
                }
                
                const createdUser = await createResponse.json();
                console.log('User created successfully:', createdUser);
                
                statusEl.textContent = 'Account created successfully!';
                
                // Clear temporary storage
                localStorage.removeItem('pending_user_type');
                localStorage.removeItem('pending_oauth_provider');
                
                // Redirect to dashboard
                setTimeout(() => {
                  window.location.href = '${origin}/dashboard';
                }, 1000);
                
              } catch (error) {
                console.error('Error in auth callback:', error);
                showError(error.message || 'An unexpected error occurred');
                
                // Try to redirect anyway after a delay
                setTimeout(() => {
                  // If we have a session but something went wrong, still try to go to dashboard
                  // The auth store will handle creating a basic user record
                  window.location.href = '${origin}/dashboard';
                }, 3000);
              }
            })();
          </script>
        </body>
      </html>
    `;

    return new NextResponse(callbackHtml, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  }

  // No code, redirect to home
  return NextResponse.redirect(`${origin}/`);
}
