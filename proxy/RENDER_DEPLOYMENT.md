# StockTracker API Proxy - Render.com Deployment Guide

## Quick Deploy to Render (5 minutes)

### Step 1: Prepare Your Code
1. Make sure `package.json` and `server.js` are in the `/proxy` folder
2. Create a `.env` file with your Alpha Vantage key:
   ```
   ALPHA_VANTAGE_KEY=your_actual_api_key_here
   ```
3. Push to GitHub (if using GitHub deployment) or note the files locally

### Step 2: Create Render Service

1. Go to https://render.com and log in
2. Click **New +** → **Web Service**
3. Choose deployment method:
   - **Option A: Connect GitHub** (easiest for updates)
     - Connect your GitHub account
     - Select your StockTracker repository
   - **Option B: Public GitHub URL** (simpler if private repo)
     - Paste your repo URL

4. Fill in the form:
   - **Name**: `stocktracker-api-proxy` (or any name)
   - **Runtime**: Select `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free tier is fine

5. Click **Create Web Service**

### Step 3: Add Environment Variables

1. Once service is created, go to **Environment**
2. Click **Add Environment Variable**
3. Add:
   - **Key**: `ALPHA_VANTAGE_KEY`
   - **Value**: Your Alpha Vantage API key
4. Click **Save**

Render will automatically redeploy with the new environment variable!

### Step 4: Wait for Deployment

- Render will build and deploy automatically
- You'll see logs streaming
- Look for: `✅ StockTracker API Proxy running on port 3000`
- Once deployed, you'll get a URL like: `https://stocktracker-api-proxy.onrender.com`

### Step 5: Update StockTracker Configuration

Update your [js/config.js](../js/config.js) to use the proxy:

**Find this section (~line 21):**
```javascript
alphavantage: {
    apiKey: 'YOUR_KEY',
    baseUrl: 'https://www.alphavantage.co/query'
}
```

**Replace with:**
```javascript
alphavantage: {
    apiKey: 'proxy', // Indicates using proxy
    baseUrl: 'https://stocktracker-api-proxy.onrender.com' // Your Render URL
}
```

### Step 6: Test the Proxy

1. Hard refresh your StockTracker: `Cmd+Shift+R`
2. Search for "AAPL"
3. Should work! Check browser console for `Cache HIT` or `Cache MISS` logs

## Proxy Endpoints

The proxy provides these endpoints:

- **Health Check**: `GET /health`
- **Search**: `GET /api/search/AAPL`
- **Quote**: `GET /api/quote/AAPL`
- **Time Series**: `GET /api/timeseries/AAPL/daily`
- **Cache Stats**: `GET /api/cache/stats` (debug)
- **Clear Cache**: `POST /api/cache/clear` (admin)

## How It Works

1. **First Request**: Browser → Proxy → Alpha Vantage (uses 1 API call)
2. **Cached Requests**: Browser → Proxy (uses 0 API calls, instant!)
3. **Cache Duration**: 1 hour for quotes, 24 hours for historical data

## Troubleshooting

**"Cannot connect to proxy"**
- Check the URL is correct in config.js
- Verify Render service is running (check Render dashboard)
- Wait 2-3 minutes for cold start if service just deployed

**"API Rate Limited"**
- You've hit Alpha Vantage's 25/day limit
- Proxy caching helps, but need 25 fresh lookups/day
- Try again tomorrow

**"Cache not working"**
- Check logs in Render dashboard
- Look for "Cache HIT" or "Cache MISS" messages
- If always "MISS", cache isn't storing results

## Keep Render Service Alive

Render free tier spins down after 15 minutes of inactivity. To prevent this:
- Add a cron job or ping service (pingkeep.com is free)
- Or upgrade to paid tier (~$5/month)

## Next Steps

Once proxy is working:
- StockTracker now calls your proxy instead of Alpha Vantage directly
- Much better rate limit (25 requests spread across unlimited user actions)
- Can add more features to proxy (filtering, more endpoints, etc.)
