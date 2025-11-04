# Supabase Dashboard Configuration

## Go to your Supabase Dashboard:
https://supabase.com/dashboard/project/eniuppqtbtethfftqziu

## Navigate to: Authentication → URL Configuration

### Set these values:

1. **Site URL**: 
   - Production: `https://app.viewer.gg`
   - (This is where users are redirected after confirmation emails)

2. **Redirect URLs** (Add ALL of these):
   ```
   https://app.viewer.gg/auth/callback
   https://app.viewer.gg/auth/callback/discord
   https://app.viewer.gg/auth/callback/google
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/callback/discord
   http://localhost:3000/auth/callback/google
   ```

3. **External OAuth Providers** (if using Discord OAuth):
   - Go to Authentication → Providers → Discord
   - Make sure it's enabled
   - Discord Application ID and Secret should be set there
   
## Important: You DON'T need to add Supabase keys anywhere else!

The keys are only needed in:
- `.env.local` for local development
- Vercel Environment Variables for production
- That's it!

## Discord Developer Portal Configuration:
Go to: https://discord.com/developers/applications
Select your app → OAuth2 → Redirects

Add these redirect URIs:
- `https://app.viewer.gg/auth/callback/discord`
- `https://app.viewer.gg/auth/callback`
- `https://eniuppqtbtethfftqziu.supabase.co/auth/v1/callback` (Supabase's OAuth handler)
- `http://localhost:3000/auth/callback/discord` (for local testing)
