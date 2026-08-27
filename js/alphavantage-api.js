/* ============================================
   ALPHA-VANTAGE-API.JS - Alpha Vantage API Integration
   ============================================ */

const FinnhubAPI = {
    baseUrl: CONFIG.alphavantage.baseUrl,
    apiKey: CONFIG.alphavantage.apiKey,

    /**
     * Make API request with error handling
     * @param {Object} params - Query parameters
     * @param {number} retry - Current retry attempt
     * @returns {Promise<Object>} API response
     */
    async request(params = {}, retry = 0) {
        try {
            // Add API key to params
            params.apikey = this.apiKey;

            // Build query string
            const queryParts = [];
            for (const [key, value] of Object.entries(params)) {
                if (value !== null && value !== undefined && value !== '') {
                    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
                }
            }
            const queryString = queryParts.join('&');
            const url = `${this.baseUrl}?${queryString}`;

            const response = await fetch(url, {
                method: 'GET',
                timeout: CONFIG.api.timeout
            });

            if (!response.ok) {
                const errorText = await response.text();
                devLog(`API Status: ${response.status}`);
                devLog(`Response: ${errorText}`);
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            devLog(`API Response:`, data);
            
            // Check for rate limit messages
            if (data.Note) {
                throw new Error(`API Rate Limited: ${data.Note}`);
            }
            
            if (data.Information && data.Information.includes('Thank you')) {
                throw new Error(`API Rate Limited (demo key). Please get your own free key at https://www.alphavantage.co/api/`);
            }
            
            // Check for free tier daily rate limit
            if (data.Information && data.Information.includes('25 requests per day')) {
                throw new Error(`API Daily Limit Reached (25/day). Please try again tomorrow or upgrade: https://www.alphavantage.co/premium/`);
            }

            if (data.Error || (data['Error Message'] && data['Error Message'].includes('Invalid'))) {
                throw new Error(data['Error Message'] || data.Error || 'Unknown API error');
            }

            devLog(`API request successful`);
            return data;
        } catch (error) {
            // Retry on rate limit with exponential backoff
            if (error.message.includes('Rate Limited') && retry < CONFIG.api.maxRetries) {
                const delay = CONFIG.api.retryDelay * Math.pow(2, retry);
                devLog(`Rate limited. Retrying in ${delay}ms (attempt ${retry + 1}/${CONFIG.api.maxRetries})`);
                await this.sleep(delay);
                return this.request(params, retry + 1);
            }
            
            devError(`API request failed:`, error);
            throw error;
        }
    },

    /**
     * Sleep helper for retry delays
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ============================================
    // SEARCH
    // ============================================

    /**
     * Search for stocks by ticker or company name
     * @param {string} query - Search query (ticker or company name)
     * @returns {Promise<Array>} Array of matching stocks
     */
    async search(query) {
        try {
            if (!query || query.trim().length === 0) {
                return [];
            }

            const response = await this.request({
                function: 'SYMBOL_SEARCH',
                keywords: query
            });
            
            if (!response.bestMatches) {
                return [];
            }

            // Filter and format results
            return response.bestMatches
                .filter(item => item['1. symbol'] && !item['1. symbol'].includes('.'))
                .map(item => ({
                    ticker: item['1. symbol'],
                    name: item['2. name'],
                    type: item['3. type'],
                    exchange: item['4. region']
                }))
                .slice(0, 10); // Limit to top 10 results
        } catch (error) {
            devError('Search error:', error);
            throw error;
        }
    },

    // ============================================
    // QUOTE / PRICE DATA
    // ============================================

    /**
     * Get current stock price and metrics
     * @param {string} ticker - Stock ticker
     * @returns {Promise<Object>} Stock quote data
     */
    async getQuote(ticker) {
        try {
            const response = await this.request({
                function: 'GLOBAL_QUOTE',
                symbol: ticker
            });
            
            devLog(`Quote response keys:`, Object.keys(response));
            const quote = response['Global Quote'];
            devLog(`Global Quote object:`, quote);
            devLog(`Price field value:`, quote ? quote['05. price'] : 'quote is null/undefined');
            
            if (!quote || !quote['05. price']) {
                devError(`Quote missing! Response:`, response);
                throw new Error(`No quote data for ${ticker}`);
            }

            return {
                ticker: ticker,
                price: parseFloat(quote['05. price']),
                previousClose: parseFloat(quote['08. previous close']),
                open: parseFloat(quote['02. open'] || 0),
                high: parseFloat(quote['03. high'] || 0),
                low: parseFloat(quote['04. low'] || 0),
                volume: parseInt(quote['06. volume'] || 0),
                timestamp: new Date().toISOString(),
                change: parseFloat(quote['09. change'] || 0),
                changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || 0)
            };
        } catch (error) {
            devError(`Error fetching quote for ${ticker}:`, error);
            throw error;
        }
    },

    // ============================================
    // COMPANY PROFILE
    // ============================================

    /**
     * Get company profile information
     * @param {string} ticker - Stock ticker
     * @returns {Promise<Object>} Company profile data
     */
    async getCompanyProfile(ticker) {
        try {
            // Alpha Vantage doesn't have a dedicated company endpoint in free tier
            // Return basic info based on quote
            const quote = await this.getQuote(ticker);
            
            return {
                ticker: ticker,
                name: ticker,
                exchange: 'Unknown',
                currency: 'USD',
                ipo: 'N/A',
                marketCapitalization: null,
                peRatio: null,
                dividendYield: null,
                country: 'USA',
                industry: 'N/A',
                website: 'N/A',
                description: `Stock information for ${ticker}`,
                logo: null,
                sector: 'N/A'
            };
        } catch (error) {
            devError(`Error fetching company profile for ${ticker}:`, error);
            throw error;
        }
    },

    // ============================================
    // HISTORICAL DATA / TIME SERIES
    // ============================================

    /**
     * Get historical price data
     * @param {string} ticker - Stock ticker
     * @param {string} interval - Time interval ('1min', '5min', '15min', 'daily', 'weekly', 'monthly')
     * @returns {Promise<Array>} Array of candle data
     */
    async getTimeSeries(ticker, interval = 'daily') {
        try {
            let endpoint;
            
            if (interval === '1min' || interval === '5min' || interval === '15min') {
                endpoint = 'TIME_SERIES_INTRADAY';
            } else if (interval === 'weekly') {
                endpoint = 'TIME_SERIES_WEEKLY';
            } else if (interval === 'monthly') {
                endpoint = 'TIME_SERIES_MONTHLY';
            } else {
                endpoint = 'TIME_SERIES_DAILY';
            }

            const params = {
                function: endpoint,
                symbol: ticker,
                outputsize: 'compact' // Get latest data only (faster)
            };

            if (interval === '1min' || interval === '5min' || interval === '15min') {
                params.interval = interval;
            }

            const response = await this.request(params);

            // Find the data key (varies by function)
            let dataKey = Object.keys(response).find(key => 
                key.includes('Time Series') || 
                key === 'data'
            );

            if (!dataKey || !response[dataKey]) {
                return [];
            }

            const timeSeries = response[dataKey];
            
            // Convert to array and format
            return Object.entries(timeSeries)
                .map(([date, data]) => ({
                    timestamp: new Date(date).getTime(),
                    date: date,
                    open: parseFloat(data['1. open'] || 0),
                    high: parseFloat(data['2. high'] || 0),
                    low: parseFloat(data['3. low'] || 0),
                    close: parseFloat(data['4. close'] || 0),
                    volume: parseInt(data['5. volume'] || 0)
                }))
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(-100); // Return last 100 candles
        } catch (error) {
            devError(`Error fetching time series for ${ticker}:`, error);
            throw error;
        }
    },

    /**
     * Get price data for specified timeframe
     * @param {string} ticker - Stock ticker
     * @param {string} timeframe - Timeframe ('24h', '1w', '1m', '1y', 'all')
     * @returns {Promise<Array>} Array of price data
     */
    async getPriceHistory(ticker, timeframe = '1m') {
        try {
            let interval;

            switch (timeframe) {
                case '24h':
                    interval = '5min';
                    break;
                case '1w':
                    interval = '15min';
                    break;
                case '1m':
                    interval = 'daily';
                    break;
                case '1y':
                    interval = 'weekly';
                    break;
                case 'all':
                    interval = 'monthly';
                    break;
                default:
                    interval = 'daily';
            }

            return this.getTimeSeries(ticker, interval);
        } catch (error) {
            devError(`Error fetching price history for ${ticker}:`, error);
            throw error;
        }
    },

    // ============================================
    // NEWS (using Alpha Vantage News endpoint if available)
    // ============================================

    /**
     * Get company news (Alpha Vantage doesn't have dedicated news API in free tier)
     * @param {string} ticker - Stock ticker
     * @param {number} limit - Number of articles to return
     * @returns {Promise<Array>} Empty array (not available in free tier)
     */
    async getNews(ticker, limit = 10) {
        try {
            // Alpha Vantage doesn't provide news in free tier
            // Return empty array
            return [];
        } catch (error) {
            devError(`Error fetching news for ${ticker}:`, error);
            return [];
        }
    },

    // ============================================
    // CACHED REQUESTS
    // ============================================

    /**
     * Get quote with caching
     * @param {string} ticker - Stock ticker
     * @returns {Promise<Object>} Stock quote data
     */
    async getQuoteCached(ticker) {
        const cacheKey = `quote_${ticker}`;
        const cached = StorageService.getCache(cacheKey);
        
        if (cached) {
            devLog(`Using cached quote for ${ticker}`);
            return cached;
        }

        const data = await this.getQuote(ticker);
        StorageService.setCache(cacheKey, data, CONFIG.api.priceCacheTTL);
        return data;
    },

    /**
     * Get company profile with caching
     * @param {string} ticker - Stock ticker
     * @returns {Promise<Object>} Company profile data
     */
    async getCompanyProfileCached(ticker) {
        const cacheKey = `profile_${ticker}`;
        const cached = StorageService.getCache(cacheKey);
        
        if (cached) {
            devLog(`Using cached company profile for ${ticker}`);
            return cached;
        }

        const data = await this.getCompanyProfile(ticker);
        StorageService.setCache(cacheKey, data, CONFIG.api.companyInfoCacheTTL);
        return data;
    }
};
