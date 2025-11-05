#!/usr/bin/env pwsh
# Setup script for viewer.gg authentication

Write-Host "🚀 Setting up viewer.gg authentication..." -ForegroundColor Cyan
Write-Host ""

# Navigate to web directory
Set-Location C:\Users\rados\viewer.gg\web

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install @supabase/ssr@^0.5.2

Write-Host ""
Write-Host "✅ Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Remind about database migration
Write-Host "⚠️  IMPORTANT: Database Migration Required" -ForegroundColor Red
Write-Host ""
Write-Host "You need to run the following SQL in Supabase Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "ALTER TABLE users" -ForegroundColor White
Write-Host "ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('organizer', 'streamer'))," -ForegroundColor White
Write-Host "ADD COLUMN IF NOT EXISTS oauth_provider TEXT," -ForegroundColor White
Write-Host "ADD COLUMN IF NOT EXISTS streaming_platform TEXT CHECK (streaming_platform IN ('Twitch', 'YouTube', 'Kick'));" -ForegroundColor White
Write-Host ""
Write-Host "CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);" -ForegroundColor White
Write-Host "CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider);" -ForegroundColor White
Write-Host ""

# OAuth configuration reminder
Write-Host "🔧 OAuth Configuration:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to Supabase Dashboard → Authentication → Providers" -ForegroundColor White
Write-Host "2. Enable and configure:" -ForegroundColor White
Write-Host "   - Google (for organizers)" -ForegroundColor White
Write-Host "   - Discord (for organizers)" -ForegroundColor White
Write-Host "   - Twitch (for streamers)" -ForegroundColor White
Write-Host "   - YouTube (for streamers)" -ForegroundColor White
Write-Host ""
Write-Host "3. Set redirect URL: http://localhost:3001/auth/callback" -ForegroundColor White
Write-Host ""

# Summary
Write-Host "📚 Next Steps:" -ForegroundColor Green
Write-Host "1. Run the database migration above" -ForegroundColor White
Write-Host "2. Configure OAuth providers in Supabase" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host "4. Test authentication at http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed info, see: AUTH_BEST_PRACTICES_FIX.md" -ForegroundColor Cyan
Write-Host ""
