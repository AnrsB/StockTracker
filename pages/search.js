/* ============================================
   SEARCH.JS - Search Page Controller
   ============================================ */

const Search = {
    debounceTimer: null,
    currentSearchResults: [],
    selectedStock: null,
    initialized: false, // Track if already initialized

    /**
     * Initialize search page
     */
    init() {
        // Prevent duplicate initialization
        if (this.initialized) {
            devLog('Search page already initialized, skipping...');
            return;
        }
        
        this.setupEventHandlers();
        this.initialized = true;
        devLog('Search page initialized');
    },

    /**
     * Setup event handlers for search page
     */
    setupEventHandlers() {
        const $searchInput = $('#search-input');
        const $searchSuggestions = $('#search-suggestions');

        // Search input with debounce
        $searchInput.on('keyup', () => {
            clearTimeout(this.debounceTimer);
            const query = $searchInput.val().trim();

            if (query.length < 1) {
                $searchSuggestions.removeClass('active');
                $('#search-results').html(`
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No search results yet</h3>
                        <p>Search for a stock ticker or company name to get started</p>
                    </div>
                `);
                return;
            }

            // Debounce search
            this.debounceTimer = setTimeout(() => {
                this.performSearch(query);
            }, CONFIG.ui.searchDebounceDelay);
        });

        // Click outside suggestions to close
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.search-input-group').length) {
                $searchSuggestions.removeClass('active');
            }
        });

        // Setup modal close handlers
        DomUtils.setupModalCloseHandlers('stock-details-modal');

        // Add to watchlist button in details modal
        $(document).on('click', '#add-to-watchlist-btn', () => {
            this.addToWatchlist();
        });

        // Add to wallet button in details modal
        $(document).on('click', '#add-to-wallet-btn', () => {
            this.showAddToWalletModal();
        });

        // Quick add to watchlist from search results
        $(document).on('click', '.quick-watchlist-btn', (e) => {
            e.stopPropagation();
            const ticker = $(e.currentTarget).data('ticker');
            this.quickAddToWatchlist(ticker);
        });

        // Quick add to wallet from search results
        $(document).on('click', '.quick-wallet-btn', (e) => {
            e.stopPropagation();
            const ticker = $(e.currentTarget).data('ticker');
            this.quickAddToWallet(ticker);
        });

        // Chart timeframe buttons
        $(document).on('click', '.chart-button', (e) => {
            const $btn = $(e.currentTarget);
            const timeframe = $btn.data('timeframe');
            
            $('.chart-button').removeClass('active');
            $btn.addClass('active');
            
            this.loadChart(this.selectedStock.ticker, timeframe);
        });

        // Tab switching for results view
        $(document).on('click', '.result-tab-button', (e) => {
            const $btn = $(e.currentTarget);
            const view = $btn.data('view');
            
            $('.result-tab-button').removeClass('active');
            $btn.addClass('active');
        });
    },

    /**
     * Perform stock search
     * @param {string} query - Search query
     */
    async performSearch(query) {
        try {
            DomUtils.showLoading('Searching stocks...');

            const results = await FinnhubAPI.search(query);
            this.currentSearchResults = results;

            if (results.length === 0) {
                $('#search-results').html(`
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No stocks found</h3>
                        <p>Try searching for a different ticker or company name</p>
                    </div>
                `);
                DomUtils.hideLoading();
                return;
            }

            // Render stock cards with loading state for prices
            const cards = results.map(stock => this.createSearchResultCard(stock)).join('');
            $('#search-results').html(cards);

            // Setup click handlers for Details buttons
            $(document).on('click', '.stock-card .btn-primary', (e) => {
                e.stopPropagation();
                const $card = $(e.currentTarget).closest('.stock-card');
                const ticker = $card.data('ticker');
                const stock = results.find(s => s.ticker === ticker);
                if (stock) {
                    this.showStockDetails(stock);
                }
            });

            DomUtils.hideLoading();
            devLog(`Search results: ${results.length} stocks found`);
            
            // Fetch prices in background (don't block UI)
            this.loadSearchResultPrices(results);
        } catch (error) {
            devError('Search error:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Search failed: ' + error.message, 'error');
        }
    },

    /**
     * Load prices for search results in background
     * @param {Array} results - Search results
     */
    async loadSearchResultPrices(results) {
        for (const stock of results) {
            try {
                const quote = await FinnhubAPI.getQuoteCached(stock.ticker);
                this.updateSearchResultCard(stock.ticker, quote);
            } catch (error) {
                devLog(`Failed to load price for ${stock.ticker}`);
                // Don't show error - just leave as loading
            }
        }
    },

    /**
     * Update search result card with price data
     * @param {string} ticker - Stock ticker
     * @param {Object} quote - Quote data
     */
    updateSearchResultCard(ticker, quote) {
        const $card = $(`.stock-card[data-ticker="${ticker}"]`);
        if ($card.length === 0) return;

        const changeClass = quote.change >= 0 ? 'positive' : 'negative';
        const changeIcon = quote.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

        const priceHtml = `
            <div class="stock-card-price">
                <div class="stock-card-price-main">${Formatting.formatCurrency(quote.price)}</div>
                <div class="stock-card-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${Formatting.formatCurrency(quote.change)} (${Formatting.formatPercent(quote.changePercent)})
                </div>
            </div>
        `;

        $card.find('.stock-card-price-loading').replaceWith(priceHtml);
    },

    /**
     * Create search result card HTML
     * @param {Object} stock - Stock data
     * @returns {string} HTML string
     */
    createSearchResultCard(stock) {
        return `
            <div class="stock-card" data-ticker="${stock.ticker}">
                <div class="stock-card-header">
                    <div class="stock-card-title">
                        <div class="stock-card-ticker">${DomUtils.escapeHtml(stock.ticker)}</div>
                        <div class="stock-card-name">${DomUtils.escapeHtml(stock.name)}</div>
                        <span class="stock-card-sector">${DomUtils.escapeHtml(stock.exchange || 'N/A')}</span>
                    </div>
                </div>
                <div class="stock-card-price-loading">
                    <div style="text-align: center; padding: var(--spacing-md); color: var(--text-secondary);">
                        <i class="fas fa-spinner fa-spin"></i> Loading price...
                    </div>
                </div>
                <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--border-color); display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm quick-watchlist-btn" data-ticker="${stock.ticker}" style="flex: 1; min-width: 120px;">
                        <i class="fas fa-bookmark"></i> Watchlist
                    </button>
                    <button class="btn btn-secondary btn-sm quick-wallet-btn" data-ticker="${stock.ticker}" style="flex: 1; min-width: 120px;">
                        <i class="fas fa-plus"></i> Wallet
                    </button>
                    <button class="btn btn-primary btn-sm" style="flex: 1; min-width: 120px;">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Show stock details modal
     * @param {Object} stock - Stock data
     */
    async showStockDetails(stock) {
        try {
            this.selectedStock = stock;
            DomUtils.showLoading('Loading stock details...');

            // Fetch quote data
            const quote = await FinnhubAPI.getQuoteCached(stock.ticker);
            
            // Fetch company profile
            const profile = await FinnhubAPI.getCompanyProfileCached(stock.ticker);

            // Update modal with data
            $('#details-ticker').text(stock.ticker);
            $('#details-name').text(stock.name);
            $('#details-sector').text(profile.sector || 'N/A');
            $('#details-price').text(Formatting.formatCurrency(quote.price));
            
            const changeClass = quote.change >= 0 ? 'positive' : 'negative';
            const changeIcon = quote.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
            $('#details-change').html(`
                <span class="${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${Formatting.formatCurrency(quote.change)} (${Formatting.formatPercent(quote.changePercent)})
                </span>
            `);

            // Quote data
            $('#details-open').text(Formatting.formatCurrency(quote.open || 'N/A'));
            $('#details-high').text(Formatting.formatCurrency(quote.high || 'N/A'));
            $('#details-low').text(Formatting.formatCurrency(quote.low || 'N/A'));
            $('#details-previous-close').text(Formatting.formatCurrency(quote.previousClose || 'N/A'));
            $('#details-volume').text(Formatting.formatNumber(quote.volume || 0));

            // Company info
            $('#details-ipo').text(profile.ipo || 'N/A');
            $('#details-market-cap').text(profile.marketCapitalization ? 
                Formatting.formatNumber(profile.marketCapitalization / 1000000000, 2) + 'B' : 'N/A');
            $('#details-pe-ratio').text(profile.peRatio ? 
                Formatting.formatNumber(profile.peRatio, 2) : 'N/A');
            $('#details-dividend').text(profile.dividendYield ? 
                Formatting.formatPercent(profile.dividendYield) : 'N/A');
            
            // Description
            $('#details-description').text(profile.description || 'No description available');

            // Load chart
            await this.loadChart(stock.ticker, '24h');

            DomUtils.hideLoading();
            DomUtils.showModal('stock-details-modal');
        } catch (error) {
            devError('Error loading stock details:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to load stock details', 'error');
        }
    },

    /**
     * Load price chart
     * @param {string} ticker - Stock ticker
     * @param {string} timeframe - Timeframe (24h, 1w, 1m, 1y, all)
     */
    async loadChart(ticker, timeframe) {
        try {
            const data = await FinnhubAPI.getPriceHistory(ticker, timeframe);

            if (!data || data.length === 0) {
                devLog('No chart data available');
                return;
            }

            // Prepare chart data
            const labels = data.map(d => new Date(d.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }));

            const prices = data.map(d => d.close);

            // Get canvas and destroy existing chart
            const $canvas = $('#price-chart');
            const ctx = $canvas[0].getContext('2d');
            
            if (window.priceChart) {
                window.priceChart.destroy();
            }

            // Create new chart
            window.priceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${ticker} Price`,
                        data: prices,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Price ($)'
                            }
                        }
                    }
                }
            });

            devLog(`Chart loaded for ${ticker} (${timeframe})`);
        } catch (error) {
            devError('Error loading chart:', error);
        }
    },

    /**
     * Add selected stock to watchlist
     */
    async addToWatchlist() {
        try {
            if (!FirebaseService.isLoggedIn() || !this.selectedStock) {
                DomUtils.showNotification('Please log in to add to watchlist', 'warning');
                return;
            }

            DomUtils.showLoading('Adding to watchlist...');
            
            const userId = FirebaseService.getCurrentUser().uid;
            await FirebaseService.addToWatchlist(userId, this.selectedStock.ticker);

            DomUtils.hideLoading();
            DomUtils.showNotification(`${this.selectedStock.ticker} added to watchlist!`, 'success');
            DomUtils.hideModal('stock-details-modal');
        } catch (error) {
            devError('Error adding to watchlist:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to add to watchlist', 'error');
        }
    },

    /**
     * Show add to wallet modal
     */
    showAddToWalletModal() {
        if (!this.selectedStock) return;
        
        DomUtils.hideModal('stock-details-modal');
        Wallet.showAddStockForm(this.selectedStock.ticker);
    },

    /**
     * Quick add to watchlist from search results (without opening details)
     * @param {string} ticker - Stock ticker
     */
    async quickAddToWatchlist(ticker) {
        try {
            if (!FirebaseService.isLoggedIn()) {
                DomUtils.showNotification('Please log in to add to watchlist', 'warning');
                return;
            }

            DomUtils.showLoading('Adding to watchlist...');
            
            const userId = FirebaseService.getCurrentUser().uid;
            await FirebaseService.addToWatchlist(userId, ticker);

            DomUtils.hideLoading();
            DomUtils.showNotification(`${ticker} added to watchlist!`, 'success');
        } catch (error) {
            devError('Error adding to watchlist:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to add to watchlist', 'error');
        }
    },

    /**
     * Quick add to wallet from search results (opens form without details modal)
     * @param {string} ticker - Stock ticker
     */
    quickAddToWallet(ticker) {
        if (!FirebaseService.isLoggedIn()) {
            DomUtils.showNotification('Please log in to add to wallet', 'warning');
            return;
        }

        Wallet.showAddStockForm(ticker);
    }
};

// Initialize when page is shown
$(document).ready(function() {
    // Override initSearchPage to initialize Search module
    const originalInitSearchPage = App.initSearchPage;
    App.initSearchPage = function() {
        Search.init();
        originalInitSearchPage.call(this);
    };
});
