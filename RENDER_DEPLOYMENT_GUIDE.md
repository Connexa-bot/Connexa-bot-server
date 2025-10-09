# Render Deployment Guide for ConnexaBot

## Prerequisites
- GitHub repository with your code
- Render account (free tier works)

## Deployment Steps

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Updated WhatsApp bot with link code support and improved stability"
git push origin main
```

### 2. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - Name: `connexa-bot-server` (or your preferred name)
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: Leave blank (unless your code is in a subdirectory)
   
   **Build & Deploy:**
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   
   **Instance Type:**
   - Free tier is fine for testing
   - For production, consider paid tiers for better uptime

### 3. Environment Variables

Add these in the Render dashboard under **Environment**:

```env
NODE_ENV=production
PORT=10000
SERVER_URL=https://connexa-bot-server.onrender.com
AUTH_DIR=./auth
MAX_QR_WAIT=60000
OPENAI_API_KEY=your_openai_key_here
```

**Important Notes:**
- `PORT=10000` - Render automatically assigns port 10000
- `SERVER_URL` - Update with your actual Render URL after deployment
- `OPENAI_API_KEY` - Optional, only if using AI features

### 4. Persistent Storage (Important!)

⚠️ **Render free tier has ephemeral storage** - Files are deleted when the service restarts!

For persistent WhatsApp sessions, you have two options:

**Option A: Use Render Disks (Paid feature)**
1. Add a persistent disk in Render dashboard
2. Mount it to `/app/auth`
3. Update `AUTH_DIR=/app/auth` in environment variables

**Option B: Use MongoDB or External Storage**
- Modify the code to store sessions in MongoDB instead of local files
- This requires code changes to use `@rodrigogs/baileys-store` with MongoDB

### 5. Connection Improvements Applied

✅ **Enhanced stability features:**
- Increased query timeout to 60 seconds
- Better error handling and logging
- Auto-reconnect on network issues (not on logout/401)
- Retry mechanism for failed requests
- More detailed error messages

✅ **Connection closing fixes:**
- Added `defaultQueryTimeoutMs: 60000` - Prevents premature timeouts
- Added `retryRequestDelayMs: 250` - Retries failed requests
- Better reconnection logic - Only reconnects on network issues, not on auth failures
- Improved error logging to debug connection issues

### 6. Render-Specific Considerations

**Auto-Sleep (Free Tier):**
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- WhatsApp sessions may disconnect during sleep
- Solution: Upgrade to paid tier or implement keep-alive pings

**Memory Limits:**
- Free tier: 512 MB RAM
- Monitor memory usage in Render dashboard
- Consider clearing old sessions periodically

**Build Time:**
- Initial deploy: ~2-5 minutes
- Subsequent deploys: ~1-3 minutes

### 7. Testing Your Deployment

After deployment, test the API:

```bash
# Check if server is running
curl https://connexa-bot-server.onrender.com/api

# Test WhatsApp connection
curl -X POST https://connexa-bot-server.onrender.com/api/connect \
  -H "Content-Type: application/json" \
  -d '{"phone":"YOUR_PHONE_NUMBER"}'
```

### 8. Monitoring & Logs

- View logs in Render dashboard: **Logs** tab
- Monitor health: **Metrics** tab
- Set up alerts for downtime (paid feature)

### 9. Custom Domain (Optional)

1. Go to **Settings** → **Custom Domain**
2. Add your domain (e.g., api.yourapp.com)
3. Update DNS records as instructed
4. Update `SERVER_URL` environment variable

## Troubleshooting

### Connection Keeps Closing
- **Check logs** for specific error codes
- **Code 401/403** = Logout required, clear session
- **Network errors** = Auto-reconnect will trigger
- **Timeout errors** = Increase `MAX_QR_WAIT` or check network

### Service Won't Start
- Check build logs for errors
- Verify Node.js version compatibility
- Ensure all dependencies in package.json

### WhatsApp Won't Connect
- Make sure `SERVER_URL` matches your Render URL
- Check if port is accessible (should be 10000 on Render)
- Verify phone number format (no + or spaces)
- Try clearing session and reconnecting

### Memory Issues
- Monitor usage in Render dashboard
- Clear old sessions: `POST /api/logout`
- Consider upgrading to higher tier

## Production Best Practices

1. **Use Paid Tier** - Prevents auto-sleep and session loss
2. **Add Monitoring** - Set up health checks and alerts
3. **Implement Session Persistence** - Use MongoDB or Render Disks
4. **Rate Limiting** - Add rate limits to prevent abuse
5. **Backup Sessions** - Periodically backup auth data
6. **Use HTTPS** - Render provides free SSL
7. **Environment Secrets** - Store sensitive data in environment variables, not code

## Your Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Render web service
- [ ] Configure environment variables
- [ ] Add persistent storage (if needed)
- [ ] Test API endpoints
- [ ] Update frontend with new API URL
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)
- [ ] Upgrade to paid tier (recommended for production)

## Support

If you encounter issues:
1. Check Render logs for error details
2. Review this guide's troubleshooting section
3. Check WhatsApp's session status: `GET /api/status/:phone`
4. Contact Render support for platform-specific issues

---

**Your Render URL:** `https://connexa-bot-server.onrender.com/api`

Good luck with your deployment! 🚀
