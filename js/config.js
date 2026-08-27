/* ============================================
   CONFIG.JS - Application Configuration
   ============================================ */

// Load environment variables
const CONFIG = {
    // Firebase Configuration
    firebase: {
        apiKey: "AIzaSyBFBSt-p0LJpDvEE3ezSVQRBuHrJ7ecff0",
        authDomain: "stocktracker-d11ba.firebaseapp.com",
        databaseURL: "https://stocktracker-d11ba-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "stocktracker-d11ba",
        storageBucket: "stocktracker-d11ba.firebasestorage.app",
        messagingSenderId: "830387353637",
        appId: "1:830387353637:web:839b4cfa187120604727cc",
        measurementId: "G-5ML1TECRMM"
    },

    // Alpha Vantage API Configuration via Proxy (caching enabled)
    // Proxy server runs on Render.com for rate limit handling
    alphavantage: {
        apiKey: 'proxy', // Using proxy server for caching
        baseUrl: 'https://stocktracker-api-proxy.onrender.com'
    },

    // Application Settings
    app: {
        name: 'StockTracker',
        version: '1.0.0',
        environment: 'development',
        debug: true
    },

    // API Configuration
    api: {
        // Price cache TTL in milliseconds
        priceCacheTTL: 5 * 60 * 1000, // 5 minutes
        
        // Company info cache TTL
        companyInfoCacheTTL: 24 * 60 * 60 * 1000, // 24 hours
        
        // Timeout for API requests (milliseconds)
        timeout: 10000,
        
        // Max retries for failed requests
        maxRetries: 3,
        
        // Retry delay in milliseconds
        retryDelay: 1000
    },

    // UI Settings
    ui: {
        // Default theme ('light' or 'dark')
        defaultTheme: localStorage.getItem('theme') || 'light',
        
        // Toast notification duration (milliseconds)
        toastDuration: 3000,
        
        // Default pagination items per page
        itemsPerPage: 10,
        
        // Debounce delay for search input (milliseconds)
        searchDebounceDelay: 300
    },

    // Portfolio Settings
    portfolio: {
        // Default currency
        defaultCurrency: 'USD',
        
        // Number of decimal places for prices
        priceDecimalPlaces: 2,
        
        // Number of decimal places for quantities
        quantityDecimalPlaces: 4
    },

    // Error Messages
    messages: {
        error: {
            networkError: 'Network error. Please check your internet connection.',
            apiError: 'Failed to fetch data from the API. Please try again.',
            firebaseError: 'Database error. Please try again.',
            authError: 'Authentication failed. Please log in again.',
            validationError: 'Please check your input and try again.',
            notFound: 'The requested resource was not found.',
            unauthorized: 'You are not authorized to perform this action.',
            serverError: 'Server error. Please try again later.'
        },
        success: {
            itemAdded: 'Item added successfully.',
            itemUpdated: 'Item updated successfully.',
            itemDeleted: 'Item deleted successfully.',
            savedSuccessfully: 'Saved successfully.'
        },
        warning: {
            confirmDelete: 'Are you sure you want to delete this item?',
            unsavedChanges: 'You have unsaved changes. Do you want to leave this page?'
        }
    },

    // API Endpoints (relative to baseUrl)
    endpoints: {
        // Finnhub endpoints
        search: '/search',
        quote: '/quote',
        companyProfile: '/company-profile2',
        candles: '/stock/candle',
        news: '/company-news'
    }
};

// Helper function to get config value
function getConfig(path) {
    const keys = path.split('.');
    let value = CONFIG;
    for (let key of keys) {
        value = value[key];
        if (value === undefined) return null;
    }
    return value;
}

// Helper function to check if we're in development mode
function isDevelopment() {
    return CONFIG.app.environment === 'development';
}

// Helper function to log in development mode
function devLog(...args) {
    if (isDevelopment() && CONFIG.app.debug) {
        console.log('[StockTracker]', ...args);
    }
}

function devError(...args) {
    if (isDevelopment() && CONFIG.app.debug) {
        console.error('[StockTracker ERROR]', ...args);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getConfig, isDevelopment, devLog, devError };
}
