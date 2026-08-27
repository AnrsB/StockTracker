require('dotenv').config();
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;

// Cache with 1 hour TTL (time to live)
const cache = new NodeCache({ stdTtl: 3600 });

// Enable CORS for your StockTracker domain
app.use(cors({
    origin: ['http://localhost:3000', 'https://andersbusk.dk', 'http://andersbusk.dk'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Symbol search endpoint
app.get('/api/search/:query', async (req, res) => {
    try {
        const query = req.params.query.toUpperCase();
        const cacheKey = `search_${query}`;
        
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`Cache HIT for search: ${query}`);
            return res.json({ ...cached, cached: true });
        }

        console.log(`Cache MISS for search: ${query} - calling Alpha Vantage`);
        
        // Call Alpha Vantage
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'SYMBOL_SEARCH',
                keywords: query,
                apikey: ALPHA_VANTAGE_KEY
            },
            timeout: 10000
        });

        const data = response.data;

        // Check for errors/rate limits
        if (data.Note || data.Information) {
            console.warn(`Alpha Vantage warning: ${data.Note || data.Information}`);
            return res.status(429).json({ error: data.Note || data.Information });
        }

        if (data.Error) {
            console.warn(`Alpha Vantage error: ${data.Error}`);
            return res.status(400).json({ error: data.Error });
        }

        // Cache successful response
        cache.set(cacheKey, data);
        res.json({ ...data, cached: false });
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ error: 'Failed to search stocks', message: error.message });
    }
});

// Quote endpoint
app.get('/api/quote/:ticker', async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        const cacheKey = `quote_${ticker}`;
        
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`Cache HIT for quote: ${ticker}`);
            return res.json({ ...cached, cached: true });
        }

        console.log(`Cache MISS for quote: ${ticker} - calling Alpha Vantage`);
        
        // Call Alpha Vantage
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol: ticker,
                apikey: ALPHA_VANTAGE_KEY
            },
            timeout: 10000
        });

        const data = response.data;

        // Check for errors/rate limits
        if (data.Note || data.Information) {
            console.warn(`Alpha Vantage warning: ${data.Note || data.Information}`);
            return res.status(429).json({ error: data.Note || data.Information });
        }

        if (data.Error) {
            console.warn(`Alpha Vantage error: ${data.Error}`);
            return res.status(400).json({ error: data.Error });
        }

        // Cache successful response
        cache.set(cacheKey, data);
        res.json({ ...data, cached: false });
    } catch (error) {
        console.error('Quote error:', error.message);
        res.status(500).json({ error: 'Failed to fetch quote', message: error.message });
    }
});

// Time series endpoint (price history)
app.get('/api/timeseries/:ticker/:interval', async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        const interval = req.params.interval.toLowerCase();
        const cacheKey = `timeseries_${ticker}_${interval}`;
        
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`Cache HIT for timeseries: ${ticker} ${interval}`);
            return res.json({ ...cached, cached: true });
        }

        console.log(`Cache MISS for timeseries: ${ticker} ${interval} - calling Alpha Vantage`);
        
        // Map interval to Alpha Vantage function
        let func;
        if (interval === '1min' || interval === '5min' || interval === '15min') {
            func = 'TIME_SERIES_INTRADAY';
        } else if (interval === 'weekly') {
            func = 'TIME_SERIES_WEEKLY';
        } else if (interval === 'monthly') {
            func = 'TIME_SERIES_MONTHLY';
        } else {
            func = 'TIME_SERIES_DAILY';
        }

        const params = {
            function: func,
            symbol: ticker,
            outputsize: 'compact',
            apikey: ALPHA_VANTAGE_KEY
        };

        if (interval === '1min' || interval === '5min' || interval === '15min') {
            params.interval = interval;
        }

        const response = await axios.get('https://www.alphavantage.co/query', {
            params,
            timeout: 10000
        });

        const data = response.data;

        // Check for errors/rate limits
        if (data.Note || data.Information) {
            console.warn(`Alpha Vantage warning: ${data.Note || data.Information}`);
            return res.status(429).json({ error: data.Note || data.Information });
        }

        if (data.Error) {
            console.warn(`Alpha Vantage error: ${data.Error}`);
            return res.status(400).json({ error: data.Error });
        }

        // Cache successful response (longer TTL for historical data)
        cache.set(cacheKey, data, 86400); // 24 hours for historical data
        res.json({ ...data, cached: false });
    } catch (error) {
        console.error('Time series error:', error.message);
        res.status(500).json({ error: 'Failed to fetch time series', message: error.message });
    }
});

// Cache stats endpoint (for debugging)
app.get('/api/cache/stats', (req, res) => {
    const keys = cache.keys();
    res.json({
        cachedItems: keys.length,
        keys: keys,
        stats: cache.getStats()
    });
});

// Clear cache endpoint (admin)
app.post('/api/cache/clear', (req, res) => {
    cache.flushAll();
    res.json({ message: 'Cache cleared' });
});

// Catch-all for Alpha Vantage format queries (main /)
app.get('/', async (req, res) => {
    try {
        const func = req.query.function;
        const symbol = req.query.symbol?.toUpperCase();
        
        if (!func) {
            return res.status(400).json({ error: 'Missing function parameter' });
        }

        // Build cache key from function and symbol
        const cacheKey = symbol ? `${func}_${symbol}` : func;
        
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`Cache HIT for ${func} ${symbol || ''}`);
            return res.json(cached);
        }

        console.log(`Cache MISS for ${func} ${symbol || ''} - calling Alpha Vantage`);
        
        // Forward all query params to Alpha Vantage (except apikey, replace with ours)
        const params = { ...req.query };
        params.apikey = ALPHA_VANTAGE_KEY;
        
        const response = await axios.get('https://www.alphavantage.co/query', {
            params,
            timeout: 10000
        });

        const data = response.data;

        // Check for rate limit/errors
        if (data.Note || data.Information) {
            console.warn(`Alpha Vantage: ${data.Note || data.Information}`);
            return res.status(429).json(data);
        }

        if (data.Error) {
            console.warn(`Alpha Vantage error: ${data.Error}`);
            return res.status(400).json(data);
        }

        // Cache successful response
        cache.set(cacheKey, data);
        res.json(data);
    } catch (error) {
        console.error('Query error:', error.message);
        res.status(500).json({ error: 'Failed to process request', message: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`✅ StockTracker API Proxy running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Using Alpha Vantage key: ${ALPHA_VANTAGE_KEY ? '****' + ALPHA_VANTAGE_KEY.slice(-4) : 'NOT SET'}`);
});
