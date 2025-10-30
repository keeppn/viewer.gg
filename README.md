# Viewer.gg - Co-streaming Management Platform

A comprehensive platform for tournament organizers to manage co-streamers across Twitch, YouTube Gaming, and Kick.

## 🚀 Features

### Core Functionality
- **Application Management**: Create customizable forms, review applications, bulk approve/reject
- **Real-time Analytics**: Live viewership tracking, historical data, performance metrics
- **Discord Integration**: Automated role assignment and messaging via Discord bot
- **Report Generation**: Create sponsor-ready PDF/CSV reports with custom branding
- **Live Monitoring**: Real-time dashboard showing active co-streamers and viewership

### Advanced Features
- OAuth authentication (Twitch, Google, Discord)
- Multi-platform streaming support
- Customizable application forms with dynamic fields
- Viewership snapshots and historical trends
- Application funnel analytics
- Automated Discord notifications
- Role-based access control (Admin, Community Manager, Marketing)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Discord Bot (optional, for Discord integration)
- API keys for streaming platforms:
  - Twitch API credentials
  - YouTube API key (optional)
  - Kick API key (optional)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd viewer.gg
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema file:
   ```sql
   -- Copy and paste content from supabase/schema.sql
   ```
3. Get your project credentials from Settings > API

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth Providers
VITE_TWITCH_CLIENT_ID=your_twitch_client_id
VITE_TWITCH_CLIENT_SECRET=your_twitch_client_secret
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret

# Discord Bot
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_BOT_CLIENT_ID=your_discord_bot_client_id

# Streaming Platform APIs
TWITCH_API_CLIENT_ID=your_twitch_api_client_id
TWITCH_API_CLIENT_SECRET=your_twitch_api_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
```

### 4. Configure OAuth Providers in Supabase

#### Twitch OAuth
1. Go to [dev.twitch.tv/console](https://dev.twitch.tv/console)
2. Create a new application
3. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to `.env`

#### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project and enable Google+ API
3. Create OAuth credentials
4. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret to `.env`

#### Discord OAuth
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret to `.env`

Then configure each provider in Supabase:
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Twitch, Google, and Discord
3. Enter the respective Client IDs and Secrets

### 5. Set Up Discord Bot (Optional but Recommended)

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Create a new application or use existing one
3. Go to Bot section and create a bot
4. Copy the bot token to `DISCORD_BOT_TOKEN` in `.env`
5. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
6. Generate invite URL with these permissions:
   - Manage Roles
   - Send Messages
   - Read Message History
7. Invite bot to your Discord server

## 🚀 Running the Application

### Development Mode

```bash
# Start the web application
npm run dev

# In a separate terminal, start the Discord bot
npm run discord-bot
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
viewer.gg/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── icons/          # Icon components
│   ├── layout/         # Layout components
│   └── tournaments/    # Tournament-specific components
├── pages/              # Page components
├── lib/                # Utilities and configurations
│   ├── api/           # API service functions
│   └── supabase.ts    # Supabase client
├── store/             # Zustand state management
├── discord-bot/       # Discord bot implementation
├── supabase/          # Database schema and migrations
└── types.ts           # TypeScript type definitions
```

## 🔑 Key Files

- `.env.example` - Template for environment variables
- `supabase/schema.sql` - Database schema
- `lib/supabase.ts` - Supabase client configuration
- `store/authStore.ts` - Authentication state
- `store/appStore.ts` - Application state
- `discord-bot/index.ts` - Discord bot logic

## 📊 Database Schema

The application uses PostgreSQL via Supabase with the following main tables:

- `organizations` - Tournament organizer organizations
- `users` - User accounts with role-based access
- `tournaments` - Tournament details and configuration
- `applications` - Co-streamer applications
- `live_streams` - Real-time streaming data
- `viewership_snapshots` - Historical viewership data
- `discord_configs` - Discord integration settings
- `report_configs` - Report generation configurations

## 🔐 Authentication Flow

1. User clicks "Sign in with [Provider]"
2. Redirected to OAuth provider
3. After approval, redirected back to app
4. Supabase creates/updates user session
5. User profile fetched from database
6. Redirected to dashboard

## 🤖 Discord Bot Features

- Automatic role assignment on application approval
- Direct messaging to approved/rejected applicants
- Announcement channel notifications
- Real-time application status updates via Supabase Realtime

## 📝 Creating Your First Tournament

1. Sign in to the dashboard
2. Navigate to Tournaments
3. Click "Create New Tournament"
4. Fill in tournament details:
   - Title, game, dates
   - Upload banner/logo
   - Configure Discord settings (optional)
5. Customize application form fields
6. Set approval/rejection messages
7. Publish tournament

## 🎯 Managing Applications

1. Go to Applications page
2. Filter by status (All, Pending, Approved, Rejected)
3. Review application details
4. Approve or reject with optional notes
5. Discord bot automatically notifies applicants

## 📈 Analytics & Reports

### Live Monitoring
- Navigate to Live tab during events
- See real-time viewer counts
- Monitor all active co-streams
- Track peak viewership

### Historical Analytics
- View application funnel
- Analyze viewership trends
- Top performer leaderboards
- Platform and language breakdowns

### Report Generation
1. Go to Reports page
2. Select tournament and date range
3. Customize branding (logos, colors)
4. Choose sections to include
5. Generate PDF or CSV
6. Share with sponsors

## 🔧 Troubleshooting

### OAuth Issues
- Verify redirect URLs match exactly in provider settings and Supabase
- Check that provider is enabled in Supabase Auth settings
- Ensure client credentials are correct

### Discord Bot Not Working
- Verify bot token is correct
- Check bot has necessary permissions in Discord server
- Ensure bot is added to the server
- Verify Discord integration is set up in Settings

### Database Errors
- Confirm Supabase credentials are correct
- Check that schema.sql was executed successfully
- Verify RLS policies are enabled

## 📚 API Documentation

### Tournaments API
```typescript
// Get all tournaments
tournamentApi.getAll(organizationId)

// Create tournament
tournamentApi.create(tournamentData)

// Update tournament
tournamentApi.update(id, updates)
```

### Applications API
```typescript
// Get applications
applicationApi.getByTournament(tournamentId)
applicationApi.getByOrganization(organizationId)

// Update status
applicationApi.updateStatus(id, status, reviewedBy, notes)
```

### Analytics API
```typescript
// Get live streams
analyticsApi.getLiveStreams(tournamentId)

// Get analytics
analyticsApi.getAnalytics(tournamentId, startDate, endDate)
```

## 🚢 Deployment

### Vercel (Recommended for Frontend)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Discord Bot Hosting

Host the Discord bot separately:
- Railway
- Heroku
- DigitalOcean
- AWS EC2

Run with: `npm run discord-bot`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions:
- GitHub Issues: [Repository Issues]
- Email: support@viewer.gg
- Discord: [Community Server]

## 🗺️ Roadmap

- [ ] Advanced analytics dashboard
- [ ] YouTube and Kick API integration
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Automated sponsor report scheduling
- [ ] Streamer profile system
- [ ] One-click application system
- [ ] Advanced role permissions
- [ ] White-label solutions

---

Built with ❤️ for the esports community
