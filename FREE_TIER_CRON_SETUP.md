# Free Tier Cron Setup Guide (Vercel Hobby Plan)

Since Vercel's Hobby (free) plan only allows **2 cron jobs per day**, you need to use a **free external cron service** to trigger the stream polling endpoint every 3-5 minutes.

---

## 🎯 **Quick Setup (5 minutes)**

We'll use **cron-job.org** - a completely free service with no signup required for basic use.

### **Step 1: Get Your API Endpoint**

After deploying to Vercel, your polling endpoint will be:

```
https://your-project.vercel.app/api/cron/poll-streams
```

Replace `your-project` with your actual Vercel project name.

### **Step 2: Generate CRON_SECRET**

For security, generate a random secret:

**Option A: Using Terminal**
```bash
openssl rand -base64 32
```

**Option B: Using Node.js**
```javascript
require('crypto').randomBytes(32).toString('base64')
```

**Option C: Online Generator**
Visit: https://www.random.org/strings/ and generate a random string

Copy this secret - you'll need it in two places.

### **Step 3: Add CRON_SECRET to Vercel**

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   ```
   Name: CRON_SECRET
   Value: <paste your generated secret>
   ```
3. Click **Save**
4. **Redeploy** your project (or it will be deployed automatically when you push changes)

### **Step 4: Set Up cron-job.org**

1. **Go to:** https://cron-job.org/en/
2. **Click:** "Create cronjob" (no signup needed for 1 job)
3. **Fill in the form:**

   **Title:** `Viewer.gg Stream Polling`

   **URL:** `https://your-project.vercel.app/api/cron/poll-streams`

   **Schedule:**
   - **Every:** `3 minutes` (or `5 minutes` for less frequent polling)
   - **Hours:** `Every hour` (0-23)
   - **Days:** `Every day`

   **Request method:** `GET`

   **HTTP headers:** Click "Add header"
   - **Header name:** `Authorization`
   - **Header value:** `Bearer <your_cron_secret_here>`

   **Timeout:** `30 seconds`

4. **Click:** "Create cronjob"

---

## ✅ **Verify It's Working**

### **Check cron-job.org Logs**

1. Go back to cron-job.org
2. Click on your job
3. View execution history
4. You should see **HTTP 200 OK** responses

**Example successful response:**
```json
{
  "success": true,
  "timestamp": "2025-11-18T12:00:00.000Z",
  "stats": {
    "streamersChecked": 15,
    "currentlyLive": 3,
    "errors": 0
  },
  "message": "Polled 15 streamers in 842ms: 3 live, 0 errors"
}
```

### **Check Vercel Logs**

1. **Vercel Dashboard** → Your Project → **Logs**
2. Filter by `/api/cron/poll-streams`
3. You should see logs every 3-5 minutes showing:
   - `[StreamPoller] Starting poll cycle...`
   - `[StreamPoller] Found X active tournament(s)`
   - `[Twitch] Checked X streamers, Y are live`

### **Check Database**

Run this query in Supabase SQL Editor:

```sql
SELECT * FROM live_streams WHERE is_live = true ORDER BY updated_at DESC;
```

You should see records for streamers who are currently live.

---

## 🔧 **Alternative Free Cron Services**

If cron-job.org doesn't work for you, try these alternatives:

### **1. EasyCron** (Free tier: 1 job, every minute possible)

1. **Sign up:** https://www.easycron.com/user/register
2. **Create cron job:**
   - **URL:** `https://your-project.vercel.app/api/cron/poll-streams`
   - **Cron Expression:** `*/3 * * * *` (every 3 minutes)
   - **HTTP Headers:** `Authorization: Bearer <your_secret>`
3. **Free tier limits:** 1 cron job, unlimited executions

### **2. cPanel Cron Jobs** (if you have hosting)

If you have a hosting account with cPanel:

1. **cPanel** → **Cron Jobs**
2. **Common Settings:** Every 5 minutes
3. **Command:**
   ```bash
   curl -X GET "https://your-project.vercel.app/api/cron/poll-streams" -H "Authorization: Bearer your_secret_here"
   ```

### **3. GitHub Actions** (Free for public repos)

Create `.github/workflows/poll-streams.yml`:

```yaml
name: Poll Twitch Streams
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  poll:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger stream polling
        run: |
          curl -X GET "${{ secrets.API_ENDPOINT }}" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Add secrets in GitHub:**
- `API_ENDPOINT`: `https://your-project.vercel.app/api/cron/poll-streams`
- `CRON_SECRET`: Your cron secret

**⚠️ GitHub Actions limitations:**
- Scheduled workflows may be delayed during peak times
- Disabled after 60 days of repository inactivity
- Not recommended for production (unreliable timing)

### **4. Uptime Robot** (Free tier: 50 monitors, 5-min checks)

1. **Sign up:** https://uptimerobot.com/
2. **Create Monitor:**
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://your-project.vercel.app/api/cron/poll-streams`
   - **Monitoring Interval:** 5 minutes
   - **Request Method:** GET
   - **Custom HTTP Headers:**
     ```
     Authorization:Bearer your_secret_here
     ```

**Pros:** Reliable, also gives uptime monitoring
**Cons:** Minimum 5-minute interval (can't do 3 minutes)

---

## 📊 **Recommended Polling Frequencies**

| Frequency | Use Case | Accuracy | API Calls/Day |
|-----------|----------|----------|---------------|
| **3 minutes** | High-accuracy live tracking | ⭐⭐⭐⭐⭐ | 480 |
| **5 minutes** | **Recommended** - Good balance | ⭐⭐⭐⭐ | 288 |
| **10 minutes** | Low activity tournaments | ⭐⭐⭐ | 144 |
| **15 minutes** | Very infrequent updates | ⭐⭐ | 96 |

**Twitch API Limits:** 800 requests/minute (you'll be fine with any of these)

---

## 🆘 **Troubleshooting**

### **Error: "Unauthorized - Invalid cron secret"**

**Cause:** `Authorization` header doesn't match `CRON_SECRET` env var

**Fix:**
1. Check cron service is sending: `Authorization: Bearer <secret>`
2. Check Vercel env var is set correctly
3. Make sure you **redeployed** after adding env var
4. No spaces before/after the secret

### **Error: "Twitch API credentials not configured"**

**Cause:** Missing `TWITCH_CLIENT_ID` or `TWITCH_CLIENT_SECRET`

**Fix:**
1. Add both to Vercel environment variables
2. Redeploy project
3. See main guide for how to get Twitch credentials

### **Cron job runs but no streamers detected**

**Normal if:**
- No tournaments have `status = 'active'`
- No applications have `status = 'Approved'`
- Streamers aren't actually live right now

**Check:**
```sql
-- Check for active tournaments
SELECT id, title, status FROM tournaments WHERE status = 'active';

-- Check for approved Twitch streamers
SELECT
  id,
  streamer->>'platform' as platform,
  streamer->>'channel_url' as channel_url,
  status
FROM applications
WHERE status = 'Approved' AND streamer->>'platform' = 'Twitch';
```

### **Cron service shows "Timeout" errors**

**Cause:** API endpoint took too long to respond (>30 seconds)

**Fix:**
1. Increase timeout in cron service settings (if possible)
2. Check if you have 100+ streamers (batching might take time)
3. Check Vercel logs for actual errors

---

## 🔐 **Security Best Practices**

### **1. Use a Strong Secret**

❌ **Bad:** `mysecret`, `12345`, `abc`
✅ **Good:** `8kJ3nM9pL2qR5tV7wY0zX6cF4gH1bN8dS3eA`

### **2. Don't Commit Secrets to Git**

Never add your `CRON_SECRET` or `TWITCH_CLIENT_SECRET` to `.env` files that are committed.

### **3. Rotate Secrets Periodically**

Change your `CRON_SECRET` every few months:
1. Generate new secret
2. Update Vercel env var
3. Update cron service header
4. Redeploy

---

## 💰 **Cost Comparison**

All the recommended services are **100% FREE** for your use case:

| Service | Free Tier | Paid Upgrade |
|---------|-----------|--------------|
| **cron-job.org** | 1 job, any frequency | €3.95/mo for unlimited |
| **EasyCron** | 1 job, any frequency | $0.99/mo for 20 jobs |
| **Uptime Robot** | 50 monitors, 5-min interval | $7/mo for 1-min interval |
| **GitHub Actions** | Unlimited for public repos | Free for public, included in private |
| **Vercel Pro** | Unlimited crons, any frequency | $20/mo |

**Recommendation for Free Tier:** Use **cron-job.org** or **EasyCron** - both reliable and free.

---

## 🎓 **Advanced: Custom Self-Hosted Cron**

If you have your own server:

**Using Node.js:**

```javascript
// poll-twitch.js
const fetch = require('node-fetch');

const ENDPOINT = 'https://your-project.vercel.app/api/cron/poll-streams';
const SECRET = process.env.CRON_SECRET;

async function poll() {
  try {
    const response = await fetch(ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${SECRET}`
      }
    });
    const data = await response.json();
    console.log('[Cron]', data.message);
  } catch (error) {
    console.error('[Cron] Error:', error.message);
  }
}

// Run every 3 minutes
setInterval(poll, 3 * 60 * 1000);
poll(); // Run immediately
```

**Keep it running:**
```bash
# Using PM2
pm2 start poll-twitch.js --name "twitch-poller"
pm2 save
pm2 startup
```

---

## ✅ **Setup Complete Checklist**

- [ ] Generated strong `CRON_SECRET`
- [ ] Added `CRON_SECRET` to Vercel environment variables
- [ ] Added `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` to Vercel
- [ ] Redeployed project on Vercel
- [ ] Set up cron job on cron-job.org (or alternative)
- [ ] Configured `Authorization: Bearer <secret>` header
- [ ] Verified cron job is running (check logs)
- [ ] Confirmed live streams appear in database
- [ ] Tested `/dashboard/live` page shows live streamers

---

## 📞 **Need Help?**

If you're stuck:

1. **Check cron service logs** - Look for 200 OK responses
2. **Check Vercel logs** - Look for polling messages
3. **Test manually:**
   ```bash
   curl -X GET "https://your-domain.vercel.app/api/cron/poll-streams" \
     -H "Authorization: Bearer your_secret" \
     -v
   ```
4. **Check database** - Verify data is being written

---

**That's it! Your Twitch polling is now running on the free tier.** 🎉

The external cron service will trigger your endpoint every 3-5 minutes, keeping your stream data fresh without needing Vercel's paid cron features.
