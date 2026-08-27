# Alpha Vantage API Setup Guide

## Overview
StockTracker uses **Alpha Vantage** API for stock data. Alpha Vantage provides:
- ✅ Full CORS support (works in browser without proxy)
- ✅ Free tier with unlimited requests (no rate limit)
- ✅ Stock prices, historical data, technical indicators
- ✅ No backend server needed - vanilla JavaScript only!

## Setup Steps

### Step 1: Get Your Free API Key

1. Go to https://www.alphavantage.co/api/
2. Fill out the form with your email
3. Check your email for the API key
4. Copy your **API key**

### Step 2: Update Your Config

Open `js/config.js` and replace:

```javascript
// Before:
alphavantage: {
    apiKey: 'demo', // Get free key from https://www.alphavantage.co/api/
    baseUrl: 'https://www.alphavantage.co/query'
},

// After:
alphavantage: {
    apiKey: 'YOUR_ACTUAL_API_KEY', // Your received API key
    baseUrl: 'https://www.alphavantage.co/query'
},
```

### Step 3: Deploy & Test

1. Upload updated `js/config.js` to andersbusk.dk/stocktracker
2. No proxy needed - API requests work directly!
3. Hard refresh: `Cmd+Shift+R`
4. **Search for "AAPL"** → Click details → Should load instantly ✅

## API Endpoints Used

| Feature | Endpoint | Status |
|---------|----------|--------|
| Search stocks | `SYMBOL_SEARCH` | ✅ Works |
| Get quote | `GLOBAL_QUOTE` | ✅ Works |
| Historical data | `TIME_SERIES_*` | ✅ Works |
| News | Not available | Free tier limitation |

## Free Tier Features

- **Requests**: Unlimited (no throttling)
- **Data**: Up to 20 years historical
- **Updates**: End-of-day only (not real-time)
- **Symbols**: All US stocks + major international

Perfect for development and learning! No credit card required.

## If Using 'demo' Key

The 'demo' key works for testing:
- Search: Works ✅
- Quotes: Works (demo data) ✅
- Charts: Shows demo AAPL data ✅

Replace with your real API key when you want live data.

## Troubleshooting

**Search not working?**
- Verify your API key is correct in config.js
- Check browser console for error messages
- Free tier works fine - no setup needed

**Delayed data?**
- Alpha Vantage updates end-of-day only (not real-time)
- This is normal for free tier
- Upgrade to premium for real-time data

**"API rate limited" error?**
- Unlikely - free tier has unlimited requests
- Check that you're using your API key, not 'demo'
- Clear browser cache and try again

## Next Steps

Once working:
1. Test "Add to Watchlist" 
2. Test "Add to Wallet" (portfolio tracking)
3. Try different stock tickers
4. Check watchlist and portfolio pages

All features work without any backend! 🎉
