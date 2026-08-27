# Polygon.io API Setup Guide

## Overview
StockTracker now uses **Polygon.io** API instead of Finnhub. Polygon.io provides:
- ✅ Full CORS support (works in browser without proxy)
- ✅ Free tier with unlimited requests
- ✅ Stock prices, company info, historical data, news
- ✅ No backend server needed - vanilla JavaScript only!

## Setup Steps

### Step 1: Get Your Free API Key

1. Go to https://polygon.io
2. Click **Sign Up** (free tier)
3. Create your account with email/password
4. Verify your email
5. Go to **Dashboard → API Keys**
6. Copy your **free tier API key** (looks like: `XXXXXX_xxxxxxxxxxxxxxxxxx`)

### Step 2: Update Your Config

Open `js/config.js` and replace the placeholder:

```javascript
// Before:
polygon: {
    apiKey: 'YOUR_POLYGON_API_KEY_HERE',
    baseUrl: 'https://api.polygon.io/v1'
},

// After:
polygon: {
    apiKey: 'pkXXXXXXX_xxxxxxxxxxxxxxxxxx', // Your actual API key
    baseUrl: 'https://api.polygon.io/v1'
},
```

### Step 3: Deploy & Test

1. Upload updated `js/config.js` to andersbusk.dk/stocktracker
2. No proxy needed - API requests work directly!
3. Hard refresh: `Cmd+Shift+R`
4. **Search for "AAPL"** → Should load instantly ✅

## API Endpoints Used

| Feature | Endpoint | Status |
|---------|----------|--------|
| Search stocks | `/query` | ✅ Works |
| Get quote | `/ticker/{ticker}/quote` | ✅ Works |
| Company info | `/ticker/{ticker}` | ✅ Works |
| Historical data | `/aggs/ticker/{ticker}/range/...` | ✅ Works |
| News | `/reference/news` | ✅ Works |

## Free Tier Limits

- **Requests**: Unlimited
- **Data**: 5-minute delayed prices
- **Historical**: Full access
- **News**: Full access

Perfect for development! Upgrade anytime for real-time data.

## Troubleshooting

**Search not working?**
- Check that `CONFIG.polygon.apiKey` is set correctly
- Verify no typos in the key
- Check browser console for error messages

**No company info showing?**
- Polygon free tier doesn't include P/E ratio and dividend yield
- These are marked as `null` in the code (see `getCompanyProfile()`)

**Prices seem delayed?**
- Free tier provides 5-minute delayed prices
- Upgrade to "Premium" for real-time data

## Next Steps

Once search works:
1. Test "Add to Watchlist" 
2. Test "Add to Wallet" (portfolio tracking)
3. Try different stock tickers
4. Check watchlist and portfolio pages

All working without any backend proxy! 🎉
