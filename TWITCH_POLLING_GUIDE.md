# Twitch Polling System - Complete Guide

This guide explains how the automated Twitch stream tracking works and how to set it up.

---

## 📋 **What It Does**

The Twitch polling system automatically:

1. **Checks all approved streamers** every 3 minutes to see if they're live
2. **Updates the `live_streams` table** with current viewer counts
3. **Tracks peak viewers** (highest viewer count during stream)
4. **Calculates average viewers** (running average throughout stream)
5. **Collects viewership snapshots** for analytics charts
6. **Detects when streams end** and marks them offline

---

## 🏗️ **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL CRON JOB                          │
│              (Runs every 3 minutes)                         │
│                                                             │
│  Triggers: GET /api/cron/poll-streams                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│            StreamPollerService                              │
│  • Fetches active tournaments                              │
│  • Gets all approved applications                          │
│  • Extracts Twitch usernames                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              TwitchService                                  │
│  • Gets OAuth app access token                             │
│  • Calls Twitch Helix API                                  │
│  • Checks up to 100 streams at once                        │
│  • Returns live stream data                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│         Database Updates                                    │
│  • live_streams table: current/peak/avg viewers            │
│  • viewership_snapshots table: historical data             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Setup Instructions**

### **Step 1: Get Twitch API Credentials**

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Click "Register Your Application"
3. Fill in:
   - **Name:** viewer.gg Stream Tracker
   - **OAuth Redirect URLs:** `https://yourdomain.com` (not needed for app access token, but required field)
   - **Category:** Website Integration
4. Click "Create"
5. Copy your **Client ID** and **Client Secret**

### **Step 2: Add Environment Variables**

In your **Vercel Dashboard** → **Settings** → **Environment Variables**, add:

```env
TWITCH_CLIENT_ID=abc123yourClientIdHere
TWITCH_CLIENT_SECRET=xyz789yourSecretHere
CRON_SECRET=generateARandomSecretHere
```

**IMPORTANT:** The `CRON_SECRET` is optional but recommended for security. It prevents unauthorized requests to your cron endpoint.

### **Step 3: Deploy to Vercel**

The `vercel.json` file is already configured with:

```json
{
  "crons": [
    {
      "path": "/api/cron/poll-streams",
      "schedule": "*/3 * * * *"
    }
  ]
}
```

This means:
- **Every 3 minutes** (`*/3 * * * *`), Vercel will call `/api/cron/poll-streams`
- The endpoint checks all approved Twitch streamers
- Updates are automatically saved to your database

**Deploy your changes:**
```bash
git add .
git commit -m "feat: Add Twitch polling system"
git push origin master
```

Vercel will automatically deploy and start running the cron job.

### **Step 4: Verify It's Working**

**Option A: Check Vercel Logs**
1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by `/api/cron/poll-streams`
3. You should see logs every 3 minutes showing:
   - How many streamers were checked
   - How many are currently live
   - Any errors

**Option B: Manually Trigger**
You can test the endpoint manually:

```bash
# Replace with your actual domain and CRON_SECRET
curl -X GET "https://your-domain.vercel.app/api/cron/poll-streams" \
  -H "Authorization: Bearer your_cron_secret_here"
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2025-11-18T10:30:00.000Z",
  "stats": {
    "streamersChecked": 15,
    "currentlyLive": 3,
    "errors": 0
  },
  "message": "Polled 15 streamers in 1234ms: 3 live, 0 errors"
}
```

---

## 📊 **How Data Flows**

### **1. Application Approval**
When you approve a streamer application:
```
Application status → "Approved"
Streamer JSONB field contains:
{
  "name": "StreamerName",
  "platform": "Twitch",
  "channel_url": "https://twitch.tv/streamername",
  "email": "streamer@example.com",
  ...
}
```

### **2. Polling Checks Twitch**
Every 3 minutes:
```
1. Query: SELECT * FROM applications WHERE status='Approved' AND tournament.status='active'
2. Extract: channel_url → "streamername"
3. API Call: GET https://api.twitch.tv/helix/streams?user_login=streamername
4. Response: { "viewer_count": 1234, "title": "Playing Valorant", ... }
```

### **3. Database Update**
If **LIVE**:
```sql
INSERT INTO live_streams (
  application_id,
  tournament_id,
  platform,
  is_live,
  current_viewers,
  peak_viewers,
  average_viewers,
  stream_title,
  ...
) VALUES (...);
```

If **OFFLINE** (was live before):
```sql
UPDATE live_streams
SET is_live = false,
    ended_at = NOW()
WHERE application_id = '...' AND is_live = true;
```

### **4. Snapshot Collection**
After updating all streams:
```sql
INSERT INTO viewership_snapshots (
  tournament_id,
  viewer_count,    -- Sum of all current_viewers
  streamer_count,  -- Count of live streams
  timestamp
) VALUES (...);
```

These snapshots power the **24-hour viewership chart** in Analytics.

---

## 🎯 **How Streamers Are Detected**

The `TwitchService.extractUsername()` function handles multiple URL formats:

| Input | Extracted Username |
|-------|-------------------|
| `https://twitch.tv/ninja` | `ninja` |
| `https://www.twitch.tv/shroud` | `shroud` |
| `twitch.tv/pokimane` | `pokimane` |
| `xQc` | `xqc` |

**Supported Platforms:**
- ✅ **Twitch** (fully implemented)
- ⏳ **YouTube** (coming soon)
- ⏳ **Kick** (coming soon)

The polling service filters applications by `platform: "Twitch"` and only checks those.

---

## 🔍 **Monitoring & Debugging**

### **Check Logs**

**Vercel Logs:**
```
[StreamPoller] Starting poll cycle...
[StreamPoller] Found 2 active tournament(s)
[StreamPoller] Checking 15 approved streamers for "Valorant Championship"
[StreamPoller] Found 15 Twitch streamers to check
[Twitch] Requesting new app access token...
[Twitch] Access token obtained, expires in 5184000 seconds
[Twitch] Checked 15 streamers, 3 are live
[Twitch] ninja is LIVE with 12,345 viewers
[Twitch] pokimane is LIVE with 8,432 viewers
[Twitch] shroud is LIVE with 6,789 viewers
[DB] Updated live stream for application abc-123
[StreamPoller] Collecting viewership snapshots...
[StreamPoller] Snapshot: Tournament xyz - 27566 viewers across 3 streamers
[StreamPoller] Polled 15 streamers in 842ms: 3 live, 0 errors
```

### **Common Issues**

**❌ Error: "Twitch API credentials not configured"**
- **Cause:** Missing `TWITCH_CLIENT_ID` or `TWITCH_CLIENT_SECRET` env vars
- **Fix:** Add them in Vercel → Settings → Environment Variables → Redeploy

**❌ Error: "Failed to get Twitch access token: 401"**
- **Cause:** Invalid Client ID or Client Secret
- **Fix:** Double-check your credentials in Twitch Developer Console

**❌ Error: "No approved applications for X tournament"**
- **Cause:** No approved applications yet
- **Fix:** This is normal! Approve some applications first.

**❌ "Checked X streamers, 0 are live"**
- **Cause:** Streamers aren't currently streaming
- **Fix:** This is normal! Wait for them to go live, or test with a streamer you know is live.

---

## 🧪 **Testing the System**

### **Quick Test Checklist**

1. **Add Test Streamer:**
   - Go to `/dashboard/applications`
   - Create a fake application with a Twitch streamer who is **currently live**
   - Example: `channel_url: "https://twitch.tv/ninja"`
   - Approve the application

2. **Manually Trigger Cron:**
   ```bash
   curl -X GET "https://your-domain.vercel.app/api/cron/poll-streams" \
     -H "Authorization: Bearer your_cron_secret"
   ```

3. **Check Database:**
   ```sql
   SELECT * FROM live_streams WHERE is_live = true;
   ```

   You should see a record with:
   - `platform: "Twitch"`
   - `is_live: true`
   - `current_viewers: <some number>`
   - `stream_title: <stream title>`

4. **Check Analytics:**
   - Go to `/dashboard/analytics`
   - You should see the live stream appear
   - Viewer count should match Twitch

### **Testing Different Scenarios**

**Scenario 1: Stream Goes Live**
- Streamer is offline → Cron runs → No record in `live_streams`
- Streamer goes live → Next cron run → Record inserted with `is_live: true`

**Scenario 2: Stream Gets More Viewers**
- First poll: `current_viewers: 100`, `peak_viewers: 100`
- Second poll: `current_viewers: 500`, `peak_viewers: 500` (updated!)
- Third poll: `current_viewers: 300`, `peak_viewers: 500` (peak stays!)

**Scenario 3: Stream Ends**
- Stream is live → `is_live: true`
- Stream ends → Next poll detects offline → `is_live: false`, `ended_at: <timestamp>`

---

## ⚙️ **Configuration Options**

### **Change Polling Frequency**

Edit `web/vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/poll-streams",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    }
  ]
}
```

**Cron Syntax:**
- `*/3 * * * *` = Every 3 minutes
- `*/5 * * * *` = Every 5 minutes
- `0 * * * *` = Every hour (at minute 0)
- `*/30 * * * *` = Every 30 minutes

**⚠️ Warning:**
- More frequent = More API calls = Higher costs (Twitch has rate limits: 800 requests/min)
- Less frequent = Less accurate live data
- **Recommended:** 3-5 minutes is optimal

### **Disable Cron (for testing)**

Remove or comment out in `vercel.json`:
```json
{
  "crons": []
}
```

---

## 📈 **Performance & Scalability**

### **API Limits**

**Twitch Helix API:**
- **Rate Limit:** 800 requests per minute
- **Batch Size:** Up to 100 streams per request
- **Our Implementation:**
  - Batches all streamers into one request (up to 100)
  - Reuses access token (valid for 60 days)
  - Only makes 1-2 API calls per poll cycle

**Example:**
- 50 approved Twitch streamers
- 1 API call to get app token (cached)
- 1 API call to check all 50 streams
- **Total:** 2 API calls every 3 minutes = 960 calls/day

**Scalability:**
- ✅ **<100 streamers:** Single batch, very fast
- ⚠️ **100-500 streamers:** Multiple batches, still fast
- 🔴 **>500 streamers:** Need request optimization

### **Database Performance**

**Indexes Needed:**
```sql
-- Already exists in your schema
CREATE INDEX idx_applications_tournament_status ON applications(tournament_id, status);
CREATE INDEX idx_live_streams_tournament_live ON live_streams(tournament_id, is_live);
```

**Query Performance:**
- Fetching applications: `~50ms`
- Twitch API call: `~200-500ms`
- Database updates: `~100ms`
- **Total poll cycle:** Usually < 1 second for <50 streamers

---

## 🚀 **What's Next?**

After Twitch polling is working, you can:

1. **Add YouTube Support**
   - Create `youtube.service.ts`
   - Use YouTube Data API v3
   - Same pattern as Twitch

2. **Add Kick Support**
   - Create `kick.service.ts`
   - API less documented, may need scraping

3. **Add Stream Alerts**
   - Notify TOs when streams go live
   - Send Discord/Email alerts
   - Slack integration

4. **Add Stream Health Monitoring**
   - Track dropped frames
   - Alert if stream goes down
   - Quality scoring

5. **Add Clip Creation**
   - Auto-create Twitch clips at peak moments
   - Compile highlight reels for sponsors

---

## 🆘 **Troubleshooting**

### **Problem: Cron not running on Vercel**

**Check:**
1. Vercel plan supports cron (Hobby plan: only 2 crons, Pro: unlimited)
2. `vercel.json` is in the `/web` directory (Next.js root)
3. Redeploy after adding `vercel.json`
4. Check Vercel Dashboard → Project → Settings → Cron Jobs (should show scheduled job)

### **Problem: "Unauthorized" error**

**Fix:**
- Set `CRON_SECRET` env var in Vercel
- Include `Authorization: Bearer <CRON_SECRET>` header
- Or remove auth check (not recommended for production)

### **Problem: No streamers detected**

**Check:**
1. Applications have `platform: "Twitch"` (case-sensitive!)
2. `channel_url` field is filled
3. Tournament status is `"active"`
4. Application status is `"Approved"`

**Debug Query:**
```sql
SELECT
  a.id,
  a.streamer->>'platform' as platform,
  a.streamer->>'channel_url' as channel_url,
  a.status,
  t.status as tournament_status
FROM applications a
JOIN tournaments t ON t.id = a.tournament_id
WHERE a.status = 'Approved' AND t.status = 'active';
```

### **Problem: Viewer counts don't match Twitch**

**Explanation:**
- Twitch viewer counts fluctuate constantly
- Our system polls every 3 minutes
- Slight differences are normal
- `peak_viewers` will catch the highest point
- `average_viewers` smooths out fluctuations

---

## 📞 **Support**

**Need help?**
- Check Vercel logs first
- Verify environment variables are set
- Test endpoint manually
- Check database records

**Found a bug?**
- Note the exact error message
- Check what triggers it
- Look at the logs
- Report with reproduction steps

---

## ✅ **System is Working When You See:**

```
✓ Cron job scheduled in Vercel
✓ Logs show "Polled X streamers" every 3 minutes
✓ live_streams table has is_live=true records
✓ viewership_snapshots table grows over time
✓ Analytics page shows live streamers
✓ Viewer counts update every 3 minutes
```

---

**That's it! Your Twitch polling system is now fully operational.** 🎉
