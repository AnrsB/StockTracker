/* ============================================
   APP.JS - Main Application Controller
   ============================================ */

const App = {
    currentUser: null,
    currentPage: 'home',
    theme: 'light',
    listeners: {},

    /**
     * Initialize the application
     */
    async init() {
        devLog('Initializing StockTracker Application...');

        try {
            // Initialize Firebase first
            const firebaseReady = FirebaseService.init();
            if (!firebaseReady) {
                throw new Error('Firebase initialization failed');
            }

            // Load saved theme
            this.loadTheme();

            // Setup UI event handlers
            this.setupUIHandlers();

            // Wait for Firebase auth state
            await this.checkAuthState();

            devLog('Application initialized successfully');
        } catch (error) {
            devError('Application initialization error:', error);
            DomUtils.showNotification('Application initialization failed', 'error');
        }
    },

    // ============================================
    // AUTHENTICATION
    // ============================================

    /**
     * Check and setup authentication state
     */
    async checkAuthState() {
        return new Promise((resolve) => {
            FirebaseService.onAuthStateChanged((user) => {
                this.currentUser = user;
                
                if (user) {
                    devLog('User logged in:', user.email);
                    this.setupAuthenticatedApp();
                    resolve();
                } else {
                    devLog('User logged out');
                    this.setupUnauthenticatedApp();
                    resolve();
                }
            });
        });
    },

    /**
     * Setup app for authenticated user
     */
    setupAuthenticatedApp() {
        // Show authenticated navbar items
        $('.nav-link[data-page]').show();
        $('.user-menu').show();
        $('.logout-btn').show();
        $('.login-register-btns').hide();

        // Load user profile
        this.loadUserProfile();

        // Setup real-time listeners
        this.setupDataListeners();

        // Show home page
        this.showPage('home');
    },

    /**
     * Setup app for unauthenticated user
     */
    setupUnauthenticatedApp() {
        // Hide authenticated navbar items
        $('.nav-link[data-page]').hide();
        $('.user-menu').hide();
        $('.logout-btn').hide();
        $('.login-register-btns').show();

        // Show home/login page
        this.showPage('home');
    },

    /**
     * Load user profile data
     */
    async loadUserProfile() {
        try {
            if (!this.currentUser) return;

            const profile = await FirebaseService.getUserProfile(this.currentUser.uid);
            
            if (profile) {
                // Update user menu with email
                const email = profile.email || this.currentUser.email;
                $('.user-email').text(email);

                // Load portfolio summary
                this.loadPortfolioSummary();
            }
        } catch (error) {
            devError('Error loading user profile:', error);
        }
    },

    /**
     * Load portfolio summary for home page
     */
    async loadPortfolioSummary() {
        try {
            if (!this.currentUser) return;

            DomUtils.showLoading('Loading portfolio...');

            const holdings = await FirebaseService.getHoldings(this.currentUser.uid);
            
            if (holdings.length === 0) {
                // Show empty state
                $('#portfolio-summary').html(`
                    <div class="empty-state">
                        <i class="fas fa-briefcase"></i>
                        <h3>No holdings yet</h3>
                        <p>Start building your portfolio by adding stocks to your wallet.</p>
                        <button class="btn btn-primary" onclick="App.showPage('search')">
                            <i class="fas fa-search"></i> Search Stocks
                        </button>
                    </div>
                `);
                DomUtils.hideLoading();
                return;
            }

            // Calculate portfolio totals
            let totalValue = 0;
            let totalCostBasis = 0;

            for (const holding of holdings) {
                try {
                    const quote = await FinnhubAPI.getQuoteCached(holding.ticker);
                    const currentValue = holding.quantity * quote.price;
                    totalValue += currentValue;
                    totalCostBasis += holding.totalCostBasis;
                } catch (error) {
                    devError(`Error fetching quote for ${holding.ticker}:`, error);
                }
            }

            const totalGain = totalValue - totalCostBasis;
            const gainPercent = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;

            // Update summary display
            $('#portfolio-summary').html(`
                <div class="portfolio-summary">
                    <div class="summary-box">
                        <label>Portfolio Value</label>
                        <span class="value">${Formatting.formatCurrency(totalValue)}</span>
                    </div>
                    <div class="summary-box">
                        <label>Total Invested</label>
                        <span class="value">${Formatting.formatCurrency(totalCostBasis)}</span>
                    </div>
                    <div class="summary-box">
                        <label>Total Gain/Loss</label>
                        <span class="value ${totalGain >= 0 ? 'text-success' : 'text-danger'}">
                            ${Formatting.formatCurrency(totalGain)}
                        </span>
                        <span class="change ${totalGain >= 0 ? 'positive' : 'negative'}">
                            <i class="fas ${totalGain >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                            ${Formatting.formatPercent(gainPercent)}
                        </span>
                    </div>
                </div>
            `);

            DomUtils.hideLoading();
        } catch (error) {
            devError('Error loading portfolio summary:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to load portfolio summary', 'error');
        }
    },

    // ============================================
    // PAGE ROUTING
    // ============================================

    /**
     * Show page by name
     * @param {string} pageName - Page name (home, search, watchlist, wallet)
     */
    showPage(pageName) {
        // Check authentication for protected pages
        if (['search', 'watchlist', 'wallet'].includes(pageName) && !this.currentUser) {
            DomUtils.showNotification('Please log in to access this page', 'warning');
            this.showPage('home');
            return;
        }

        // Hide all pages
        $('.page').hide();
        
        // Show selected page
        $(`#page-${pageName}`).show();
        
        // Update active nav link
        $('.nav-link').removeClass('active');
        $(`.nav-link[data-page="${pageName}"]`).addClass('active');

        this.currentPage = pageName;

        // Page-specific initialization
        switch (pageName) {
            case 'search':
                this.loadPageIfNeeded('search', () => this.initSearchPage());
                break;
            case 'watchlist':
                this.loadPageIfNeeded('watchlist', () => this.initWatchlistPage());
                break;
            case 'wallet':
                this.loadPageIfNeeded('wallet', () => this.initWalletPage());
                break;
            case 'home':
            default:
                this.initHomePage();
        }

        devLog(`Page shown: ${pageName}`);
    },

    /**
     * Load page HTML if not already loaded
     * @param {string} pageName - Page name
     * @param {Function} callback - Callback after page is loaded
     */
    loadPageIfNeeded(pageName, callback) {
        // Pages are now embedded directly in index.html
        // No need to load dynamically
        callback();
    },

    /**
     * Initialize home page
     */
    async initHomePage() {
        if (this.currentUser) {
            await this.loadPortfolioSummary();
        }
    },

    /**
     * Initialize search page (placeholder)
     */
    initSearchPage() {
        if (typeof Search !== 'undefined') {
            Search.init();
        }
    },

    /**
     * Initialize watchlist page (placeholder)
     */
    initWatchlistPage() {
        if (typeof Watchlist !== 'undefined') {
            Watchlist.init();
        }
    },

    /**
     * Initialize wallet page (placeholder)
     */
    initWalletPage() {
        if (typeof Wallet !== 'undefined') {
            Wallet.init();
        }
    },

    // ============================================
    // THEME MANAGEMENT
    // ============================================

    /**
     * Load saved theme preference
     */
    loadTheme() {
        const saved = StorageService.getLocal('theme');
        this.theme = saved || CONFIG.ui.defaultTheme;
        this.applyTheme(this.theme);
    },

    /**
     * Apply theme to application
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    applyTheme(theme) {
        $('body').removeClass('light-mode dark-mode');
        
        if (theme === 'dark') {
            $('body').addClass('dark-mode');
        } else {
            $('body').addClass('light-mode');
        }

        this.theme = theme;
        StorageService.setLocal('theme', theme);
        devLog(`Theme applied: ${theme}`);
    },

    /**
     * Toggle theme
     */
    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },

    // ============================================
    // UI EVENT HANDLERS
    // ============================================

    /**
     * Setup global UI event handlers
     */
    setupUIHandlers() {
        // Navigation
        $('.nav-link[data-page]').on('click', function(e) {
            e.preventDefault();
            const page = $(this).data('page');
            App.showPage(page);
        });

        // Theme toggle
        $('.theme-toggle').on('click', function() {
            App.toggleTheme();
        });

        // Logout
        $('.logout-btn').on('click', function(e) {
            e.preventDefault();
            App.logout();
        });

        // Close modal on backdrop click
        $('.modal').on('click', function(e) {
            if (e.target === this) {
                $(this).hide();
            }
        });

        // Close modal on close button
        $('.modal-close').on('click', function() {
            $(this).closest('.modal').hide();
        });

        devLog('UI event handlers setup complete');
    },

    /**
     * Setup real-time data listeners
     */
    setupDataListeners() {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;

        // Watchlist listener
        this.listeners.watchlist = FirebaseService.onWatchlistChange(userId, (watchlist) => {
            devLog('Watchlist updated:', watchlist.length);
        });

        // Holdings listener
        this.listeners.holdings = FirebaseService.onHoldingsChange(userId, (holdings) => {
            devLog('Holdings updated:', holdings.length);
        });

        // Transactions listener
        this.listeners.transactions = FirebaseService.onTransactionsChange(userId, (transactions) => {
            devLog('Transactions updated:', transactions.length);
        });

        devLog('Data listeners setup complete');
    },

    /**
     * Cleanup listeners
     */
    cleanupListeners() {
        Object.keys(this.listeners).forEach(key => {
            if (typeof this.listeners[key] === 'function') {
                this.listeners[key]();
            }
        });
        this.listeners = {};
    },

    // ============================================
    // AUTHENTICATION ACTIONS
    // ============================================

    /**
     * Handle logout
     */
    async logout() {
        try {
            DomUtils.showLoading('Logging out...');
            
            this.cleanupListeners();
            await FirebaseService.logout();
            
            DomUtils.hideLoading();
            DomUtils.showNotification('Logged out successfully', 'success');
            
            // Refresh page
            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (error) {
            devError('Logout error:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Logout failed', 'error');
        }
    }
};

// Initialize app when DOM is ready
$(document).ready(function() {
    App.init();
});

// Cleanup on page unload
$(window).on('beforeunload', function() {
    App.cleanupListeners();
});
