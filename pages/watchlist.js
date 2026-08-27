/* ============================================
   WATCHLIST.JS - Watchlist Page Controller
   ============================================ */

const Watchlist = {
    watchlistData: [],
    filteredData: [],
    initialized: false,

    /**
     * Initialize watchlist page
     */
    init() {
        if (this.initialized) {
            devLog('Watchlist page already initialized, skipping...');
            this.loadWatchlist(); // Still reload data on page show
            return;
        }
        
        this.setupEventHandlers();
        this.initialized = true;
        this.loadWatchlist();
        devLog('Watchlist page initialized');
    },

    /**
     * Setup event handlers for watchlist page
     */
    setupEventHandlers() {
        // Search/filter
        $('#watchlist-search').on('keyup', () => {
            this.filterWatchlist();
        });

        // Sort
        $('#watchlist-sort').on('change', () => {
            this.sortWatchlist();
        });

        // Remove from watchlist
        $(document).on('click', '.remove-watchlist-btn', (e) => {
            const watchlistId = $(e.currentTarget).data('id');
            this.removeFromWatchlist(watchlistId);
        });

        // View details
        $(document).on('click', '.view-details-watchlist-btn', (e) => {
            const ticker = $(e.currentTarget).data('ticker');
            this.viewDetails(ticker);
        });

        // Add to wallet
        $(document).on('click', '.add-to-wallet-watchlist-btn', (e) => {
            const ticker = $(e.currentTarget).data('ticker');
            Wallet.showAddStockForm(ticker);
        });
    },

    /**
     * Load watchlist from Firebase
     */
    async loadWatchlist() {
        try {
            if (!FirebaseService.isLoggedIn()) {
                return;
            }

            DomUtils.showLoading('Loading watchlist...');

            const userId = FirebaseService.getCurrentUser().uid;
            this.watchlistData = await FirebaseService.getWatchlist(userId);

            // Fetch quote data for each stock
            for (const item of this.watchlistData) {
                try {
                    const quote = await FinnhubAPI.getQuoteCached(item.ticker);
                    item.price = quote.price;
                    item.change = quote.change;
                    item.changePercent = quote.changePercent;
                } catch (error) {
                    devError(`Error fetching quote for ${item.ticker}:`, error);
                    item.price = 0;
                    item.change = 0;
                    item.changePercent = 0;
                }
            }

            this.filteredData = [...this.watchlistData];
            this.renderWatchlist();
            DomUtils.hideLoading();
        } catch (error) {
            devError('Error loading watchlist:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to load watchlist', 'error');
        }
    },

    /**
     * Filter watchlist by search query
     */
    filterWatchlist() {
        const query = $('#watchlist-search').val().toLowerCase();

        if (!query) {
            this.filteredData = [...this.watchlistData];
        } else {
            this.filteredData = this.watchlistData.filter(item =>
                item.ticker.toLowerCase().includes(query) ||
                (item.name && item.name.toLowerCase().includes(query))
            );
        }

        this.sortWatchlist();
    },

    /**
     * Sort watchlist
     */
    sortWatchlist() {
        const sortBy = $('#watchlist-sort').val();

        switch (sortBy) {
            case 'name':
                this.filteredData.sort((a, b) => a.ticker.localeCompare(b.ticker));
                break;
            case 'price':
                this.filteredData.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'change':
                this.filteredData.sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
                break;
            case 'added':
                this.filteredData.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
                break;
        }

        this.renderWatchlist();
    },

    /**
     * Render watchlist table
     */
    renderWatchlist() {
        const $tbody = $('#watchlist-table-body');

        if (this.filteredData.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="7" style="text-align: center; padding: var(--spacing-lg);">
                        <div class="empty-state">
                            <i class="fas fa-bookmark"></i>
                            <h3>${this.watchlistData.length === 0 ? 'No watchlist items yet' : 'No results found'}</h3>
                            <p>${this.watchlistData.length === 0 ? 'Start adding stocks to your watchlist to monitor their performance.' : 'Try a different search'}</p>
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        const rows = this.filteredData.map(item => {
            const changeClass = (item.changePercent || 0) >= 0 ? 'positive' : 'negative';
            const changeIcon = (item.changePercent || 0) >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

            return `
                <tr>
                    <td data-label="Ticker" style="font-weight: bold; color: var(--primary-color);">${DomUtils.escapeHtml(item.ticker)}</td>
                    <td data-label="Company">${item.name || 'N/A'}</td>
                    <td data-label="Price">${Formatting.formatCurrency(item.price || 0)}</td>
                    <td data-label="Change" class="${changeClass}">
                        <i class="fas ${changeIcon}"></i>
                        ${Formatting.formatCurrency(item.change || 0)}
                    </td>
                    <td data-label="Change %" class="${changeClass}">
                        ${Formatting.formatPercent(item.changePercent || 0)}
                    </td>
                    <td data-label="Date Added">${Formatting.formatDate(item.addedDate, 'short')}</td>
                    <td data-label="Actions" style="white-space: nowrap;">
                        <button class="btn btn-sm btn-primary view-details-watchlist-btn" data-ticker="${item.ticker}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-success add-to-wallet-watchlist-btn" data-ticker="${item.ticker}">
                            <i class="fas fa-plus"></i> Wallet
                        </button>
                        <button class="btn btn-sm btn-danger remove-watchlist-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        $tbody.html(rows);
        devLog(`Rendered ${this.filteredData.length} watchlist items`);
    },

    /**
     * Remove stock from watchlist
     * @param {string} watchlistId - Watchlist item ID
     */
    async removeFromWatchlist(watchlistId) {
        try {
            if (!confirm('Remove this stock from your watchlist?')) {
                return;
            }

            DomUtils.showLoading('Removing from watchlist...');

            const userId = FirebaseService.getCurrentUser().uid;
            await FirebaseService.removeFromWatchlist(userId, watchlistId);

            DomUtils.hideLoading();
            DomUtils.showNotification('Removed from watchlist', 'success');
            
            // Reload watchlist
            this.loadWatchlist();
        } catch (error) {
            devError('Error removing from watchlist:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to remove from watchlist', 'error');
        }
    },

    /**
     * View stock details from watchlist
     * @param {string} ticker - Stock ticker
     */
    async viewDetails(ticker) {
        try {
            // Navigate to search page and show details
            const stock = {
                ticker: ticker,
                name: this.watchlistData.find(w => w.ticker === ticker)?.name || ticker
            };
            
            App.showPage('search');
            setTimeout(() => {
                Search.showStockDetails(stock);
            }, 100);
        } catch (error) {
            devError('Error viewing stock details:', error);
            DomUtils.showNotification('Failed to load stock details', 'error');
        }
    }
};

// Initialize when page is shown
$(document).ready(function() {
    // Override initWatchlistPage to initialize Watchlist module
    const originalInitWatchlistPage = App.initWatchlistPage;
    App.initWatchlistPage = function() {
        Watchlist.init();
        originalInitWatchlistPage.call(this);
    };
});
