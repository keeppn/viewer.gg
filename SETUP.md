# Complete Setup Guide for Viewer.gg

This guide will walk you through the complete setup process for the viewer.gg platform.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [OAuth Configuration](#oauth-configuration)
4. [Discord Bot Setup](#discord-bot-setup)
5. [Environment Variables](#environment-variables)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)
- A Discord account (for bot setup)
- OAuth app credentials (Twitch, Google, Discord)

## Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Fill in project details:
   - Name: `viewer-gg` (or your choice)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. Wait for project creation (2-3 minutes)

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Wait for execution to complete

### Step 3: Run Database Functions

1. Still in SQL Editor, create another new query
2. Copy contents of `supabase/functions.sql`
3. Paste and click "Run"

### Step 4: Get API Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
   - **service_role key**: Another long string (keep this secret!)

## OAuth Configuration

### Twitch OAuth Setup

1. Go to [dev.twitch.tv/console](https://dev.twitch.tv/console)
2. Click "Register Your Application"
3. Fill in:
   - Name: `viewer.gg` (or your choice)
   - OAuth Redirect URLs: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
   - Category: Choose "Website Integration"
4. Click "Create"
5. Copy the **Client ID**
6. Click "New Secret" and copy the **Client Secret**

### Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret**

### Discord OAuth Setup

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "viewer.gg" (or your choice)
4. Go to OAuth2 settings
5. Add redirect:
   - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
6. Copy **Client ID** and **Client Secret**

### Configure Providers in Supabase

1. In Supabase dashboard, go to Authentication > Providers
2. Enable Twitch:
   - Toggle "Twitch Enabled"
   - Paste Client ID and Secret
   - Click "Save"
3. Enable Google:
   - Toggle "Google Enabled"
   - Paste Client ID and Secret
   - Click "Save"
4. Enable Discord:
   - Toggle "Discord Enabled"
   - Paste Client ID and Secret  
   - Click "Save"

## Discord Bot Setup

### Step 1: Create Bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Select your application (or create new)
3. Go to "Bot" section
4. Click "Add Bot" > "Yes, do it!"
5. Under "Privileged Gateway Intents", enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Click "Reset Token" and copy the bot token
7. Save it immediately (you can't see it again)

### Step 2: Generate Invite Link

1. Go to OAuth2 > URL Generator
2. Select scopes:
   - ✅ bot
   - ✅ applications.commands
3. Select bot permissions:
   - ✅ Manage Roles
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Mention Everyone (optional)
4. Copy the generated URL
5. Open in browser and invite to your server

### Step 3: Configure Bot in Application

The bot token goes in your `.env` file. When users configure Discord integration in the app, they'll:
1. Go to Settings
2. Connect Discord
3. Enter their server/guild ID
4. Configure roles and channels

## Environment Variables

### Step 1: Copy Example File

```bash
cp .env.example .env
```

### Step 2: Fill In All Values

Open `.env` and replace all placeholder values:

```env
# Supabase (from Supabase Dashboard > Settings > API)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Twitch OAuth (from dev.twitch.tv)
VITE_TWITCH_CLIENT_ID=your_actual_client_id
VITE_TWITCH_CLIENT_SECRET=your_actual_secret
VITE_TWITCH_REDIRECT_URI=http://localhost:3000/auth/callback/twitch

# Google OAuth (from console.cloud.google.com)
VITE_GOOGLE_CLIENT_ID=your_actual_client_id
VITE_GOOGLE_CLIENT_SECRET=your_actual_secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback/google

# Discord OAuth (from discord.com/developers)
VITE_DISCORD_CLIENT_ID=your_actual_client_id
VITE_DISCORD_CLIENT_SECRET=your_actual_secret
VITE_DISCORD_REDIRECT_URI=http://localhost:3000/auth/callback/discord

# Discord Bot
DISCORD_BOT_TOKEN=your_actual_bot_token
DISCORD_BOT_CLIENT_ID=your_bot_client_id

# Streaming Platform APIs
TWITCH_API_CLIENT_ID=same_as_oauth_client_id
TWITCH_API_CLIENT_SECRET=same_as_oauth_secret
YOUTUBE_API_KEY=optional_youtube_api_key
KICK_API_KEY=optional_kick_api_key

# App Config
VITE_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Important Notes:
- Never commit `.env` to version control
- Service role key is sensitive - keep it secret
- For production, update URLs to your domain

## Running the Application

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
# Terminal 1: Start web app
npm run dev

# Terminal 2: Start Discord bot
npm run discord-bot
```

### Step 3: Access Application

Open your browser to: `http://localhost:3000`

### Step 4: Create First User

1. Click "Sign in with Twitch" (or other provider)
2. Authorize the application
3. You'll be redirected back to the dashboard

### Step 5: Create Organization

First user needs to be added to database manually:

```sql
-- Run in Supabase SQL Editor
-- Replace USER_ID with your actual auth.users ID

INSERT INTO organizations (name, logo_url)
VALUES ('My Tournament Org', null)
RETURNING id;

-- Copy the returned ID, then:
UPDATE users
SET role = 'admin', organization_id = 'YOUR_ORG_ID'
WHERE id = 'YOUR_USER_ID';
```

## Troubleshooting

### OAuth Not Working

**Problem**: "Invalid redirect URI" error

**Solution**:
1. Verify redirect URI in provider settings EXACTLY matches
2. Must include protocol (https://)
3. No trailing slashes
4. Check Supabase project URL is correct

### Discord Bot Not Responding

**Problem**: Bot appears offline or doesn't assign roles

**Solution**:
1. Check bot token is correct in `.env`
2. Verify bot is actually invited to server
3. Check bot has "Manage Roles" permission
4. Ensure bot's role is ABOVE roles it's trying to assign
5. Check console for error messages

### Database Connection Issues

**Problem**: "Failed to fetch" or connection errors

**Solution**:
1. Verify Supabase project is not paused (free tier)
2. Check project URL and keys are correct
3. Ensure schema.sql ran successfully
4. Check RLS policies are enabled

### Application Not Loading Data

**Problem**: Dashboard shows no tournaments/applications

**Solution**:
1. Check browser console for errors
2. Verify user has organization_id set
3. Confirm RLS policies allow data access
4. Check network tab for failed requests

### Build Errors

**Problem**: TypeScript or build errors

**Solution**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite

# Try building
npm run build
```

## Next Steps

After successful setup:

1. **Create Your First Tournament**
   - Go to Tournaments > New Tournament
   - Fill in details and customize form

2. **Configure Discord Integration**
   - Go to Settings > Discord
   - Enter guild ID and configure roles

3. **Test Application Flow**
   - Share application URL with testers
   - Review applications in dashboard
   - Test approval/rejection flow

4. **Generate Test Report**
   - Add some test data
   - Go to Reports
   - Generate a sample report

## Production Deployment

When ready for production:

1. Deploy frontend to Vercel/Netlify
2. Deploy Discord bot to Railway/Heroku
3. Update all redirect URIs to production URLs
4. Update environment variables
5. Enable custom domain in Supabase (optional)
6. Set up monitoring and logging

## Support

If you encounter issues not covered here:

1. Check console logs (browser and server)
2. Review Supabase logs in dashboard
3. Search GitHub issues
4. Create new issue with details

---

**Setup Complete!** 🎉

You now have a fully functional viewer.gg installation. Start managing your co-streamers!
