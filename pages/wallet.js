/* ============================================
   WALLET.JS - Wallet/Portfolio Page Controller
   ============================================ */

const Wallet = {
    holdingsData: [],
    soldStocksData: [],
    selectedTickerForSell: null,
    initialized: false,

    /**
     * Initialize wallet page
     */
    init() {
        if (this.initialized) {
            devLog('Wallet page already initialized, skipping...');
            this.loadHoldings(); // Still reload data on page show
            return;
        }
        
        this.setupEventHandlers();
        this.initialized = true;
        this.loadHoldings();
        devLog('Wallet page initialized');
    },

    /**
     * Setup event handlers for wallet page
     */
    setupEventHandlers() {
        // Tab switching
        $(document).on('click', '.tab-button', (e) => {
            const $btn = $(e.currentTarget);
            const tab = $btn.data('tab');

            $('.tab-button').removeClass('active');
            $btn.addClass('active');

            $('.tab-content').removeClass('active');
            $(`#${tab}-tab`).addClass('active');

            if (tab === 'sold') {
                this.loadSoldStocks();
            }
        });

        // Add stock form - setup modal close handlers
        DomUtils.setupModalCloseHandlers('add-stock-modal');
        DomUtils.setupModalCloseHandlers('sell-stock-modal');

        // Calculate total cost when quantity or price changes
        $(document).on('change', '#buy-price, #quantity', () => {
            this.calculateAddStockTotal();
        });

        // Save stock button
        $(document).on('click', '#save-stock-btn', () => {
            this.saveStock();
        });

        // Sell stock calculations
        $(document).on('change', '#sell-quantity, #sell-price', () => {
            this.calculateSellTotal();
        });

        // Save sell button
        $(document).on('click', '#save-sell-btn', () => {
            this.saveSellStock();
        });

        // Sell button for holdings
        $(document).on('click', '.sell-stock-btn', (e) => {
            const ticker = $(e.currentTarget).data('ticker');
            const quantity = $(e.currentTarget).data('quantity');
            this.showSellStockModal(ticker, quantity);
        });
    },

    /**
     * Load holdings from Firebase
     */
    async loadHoldings() {
        try {
            if (!FirebaseService.isLoggedIn()) {
                return;
            }

            DomUtils.showLoading('Loading holdings...');

            const userId = FirebaseService.getCurrentUser().uid;
            this.holdingsData = await FirebaseService.getHoldings(userId);

            // Fetch current prices
            for (const holding of this.holdingsData) {
                try {
                    const quote = await FinnhubAPI.getQuoteCached(holding.ticker);
                    holding.currentPrice = quote.price;
                    holding.currentValue = holding.quantity * quote.price;
                    holding.gain = holding.currentValue - holding.totalCostBasis;
                    holding.gainPercent = (holding.gain / holding.totalCostBasis) * 100;
                } catch (error) {
                    devError(`Error fetching quote for ${holding.ticker}:`, error);
                    holding.currentPrice = 0;
                    holding.currentValue = 0;
                    holding.gain = 0;
                    holding.gainPercent = 0;
                }
            }

            this.renderHoldings();
            DomUtils.hideLoading();
        } catch (error) {
            devError('Error loading holdings:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to load holdings', 'error');
        }
    },

    /**
     * Load sold stocks from Firebase
     */
    async loadSoldStocks() {
        try {
            if (!FirebaseService.isLoggedIn()) {
                return;
            }

            DomUtils.showLoading('Loading sold stocks...');

            const userId = FirebaseService.getCurrentUser().uid;
            this.soldStocksData = await FirebaseService.getSoldStocks(userId);

            this.renderSoldStocks();
            DomUtils.hideLoading();
        } catch (error) {
            devError('Error loading sold stocks:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to load sold stocks', 'error');
        }
    },

    /**
     * Render holdings table
     */
    renderHoldings() {
        const $tbody = $('#holdings-table-body');

        if (this.holdingsData.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="8" style="text-align: center; padding: var(--spacing-lg);">
                        <div class="empty-state">
                            <i class="fas fa-wallet"></i>
                            <h3>No holdings yet</h3>
                            <p>Add your first stock to start building your portfolio.</p>
                            <button class="btn btn-primary" onclick="Wallet.showAddStockForm()">
                                Add Stock
                            </button>
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        const rows = this.holdingsData.map(holding => {
            const gainClass = holding.gain >= 0 ? 'positive' : 'negative';
            const gainIcon = holding.gain >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

            return `
                <tr>
                    <td data-label="Ticker" style="font-weight: bold; color: var(--primary-color);">${DomUtils.escapeHtml(holding.ticker)}</td>
                    <td data-label="Quantity">${Formatting.formatQuantity(holding.quantity)}</td>
                    <td data-label="Avg Cost">${Formatting.formatCurrency(holding.averageBuyPrice)}</td>
                    <td data-label="Current Price">${Formatting.formatCurrency(holding.currentPrice)}</td>
                    <td data-label="Current Value">${Formatting.formatCurrency(holding.currentValue)}</td>
                    <td data-label="Gain/Loss" class="${gainClass}">
                        <i class="fas ${gainIcon}"></i>
                        ${Formatting.formatCurrency(holding.gain)}
                    </td>
                    <td data-label="Gain/Loss %" class="${gainClass}">
                        ${Formatting.formatPercent(holding.gainPercent)}
                    </td>
                    <td data-label="Actions">
                        <button class="btn btn-sm btn-warning sell-stock-btn" data-ticker="${holding.ticker}" data-quantity="${holding.quantity}">
                            <i class="fas fa-dollar-sign"></i> Sell
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        $tbody.html(rows);
        devLog(`Rendered ${this.holdingsData.length} holdings`);
    },

    /**
     * Render sold stocks table
     */
    renderSoldStocks() {
        const $tbody = $('#sold-table-body');

        if (this.soldStocksData.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="7" style="text-align: center; padding: var(--spacing-lg);">
                        <div class="empty-state">
                            <i class="fas fa-history"></i>
                            <h3>No sold stocks yet</h3>
                            <p>Sold stocks will appear here.</p>
                        </div>
                    </td>
                </tr>
            `);
            return;
        }

        const rows = this.soldStocksData.map(stock => {
            const gainClass = stock.totalGain >= 0 ? 'positive' : 'negative';
            const gainIcon = stock.totalGain >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

            return `
                <tr>
                    <td data-label="Ticker" style="font-weight: bold; color: var(--primary-color);">${DomUtils.escapeHtml(stock.ticker)}</td>
                    <td data-label="Quantity">${Formatting.formatQuantity(stock.quantity)}</td>
                    <td data-label="Buy Price">${Formatting.formatCurrency(stock.buyPrice)}</td>
                    <td data-label="Sell Price">${Formatting.formatCurrency(stock.sellPrice)}</td>
                    <td data-label="Total Gain/Loss" class="${gainClass}">
                        <i class="fas ${gainIcon}"></i>
                        ${Formatting.formatCurrency(stock.totalGain)}
                    </td>
                    <td data-label="Gain/Loss %" class="${gainClass}">
                        ${Formatting.formatPercent(stock.gainPercent)}
                    </td>
                    <td data-label="Date Sold">${Formatting.formatDate(stock.dateSold, 'short')}</td>
                </tr>
            `;
        }).join('');

        $tbody.html(rows);
        devLog(`Rendered ${this.soldStocksData.length} sold stocks`);
    },

    /**
     * Show add stock form modal
     * @param {string} ticker - Optional ticker to pre-fill
     */
    showAddStockForm(ticker = null) {
        DomUtils.clearForm('#add-stock-form');
        
        // Set date to today (after clearing form)
        const today = new Date().toISOString().split('T')[0];
        $('#buy-date').val(today);
        
        // Set ticker if provided
        if (ticker) {
            $('#stock-ticker').val(ticker);
        }

        DomUtils.showModal('add-stock-modal');
    },

    /**
     * Calculate total cost for add stock form
     */
    calculateAddStockTotal() {
        const price = parseFloat($('#buy-price').val()) || 0;
        const quantity = parseFloat($('#quantity').val()) || 0;
        const total = price * quantity;

        $('#total-cost').val(Formatting.formatCurrency(total));
    },

    /**
     * Save stock transaction
     */
    async saveStock() {
        try {
            if (!FirebaseService.isLoggedIn()) {
                DomUtils.showNotification('Please log in', 'warning');
                return;
            }

            // Validate form
            const formData = DomUtils.getFormData('#add-stock-form');
            
            if (!formData.ticker || !formData.buyDate || !formData.buyPrice || !formData.quantity) {
                DomUtils.showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (parseFloat(formData.buyPrice) <= 0) {
                DomUtils.showNotification('Price must be greater than 0', 'error');
                return;
            }

            if (parseFloat(formData.quantity) <= 0) {
                DomUtils.showNotification('Quantity must be greater than 0', 'error');
                return;
            }

            DomUtils.showLoading('Adding stock...');

            const userId = FirebaseService.getCurrentUser().uid;
            
            const transactionData = {
                ticker: formData.ticker.toUpperCase(),
                quantity: parseFloat(formData.quantity),
                pricePerShare: parseFloat(formData.buyPrice),
                purchaseDate: formData.buyDate,
                notes: formData.notes || ''
            };

            await FirebaseService.addTransaction(userId, transactionData);

            DomUtils.hideLoading();
            DomUtils.showNotification(`${transactionData.ticker} added successfully!`, 'success');
            DomUtils.hideModal('add-stock-modal');

            // Reload holdings
            this.loadHoldings();
        } catch (error) {
            devError('Error saving stock:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to add stock', 'error');
        }
    },

    /**
     * Show sell stock modal
     * @param {string} ticker - Stock ticker
     * @param {number} quantity - Available quantity
     */
    showSellStockModal(ticker, quantity) {
        this.selectedTickerForSell = ticker;
        
        $('#sell-ticker').val(ticker);
        $('#available-quantity').val(Formatting.formatQuantity(quantity));
        $('#sell-date').val(new Date().toISOString().split('T')[0]);
        
        DomUtils.clearForm('#sell-stock-form');
        $('#sell-ticker').val(ticker);
        $('#available-quantity').val(Formatting.formatQuantity(quantity));
        $('#sell-date').val(new Date().toISOString().split('T')[0]);

        DomUtils.showModal('sell-stock-modal');
    },

    /**
     * Calculate sell totals
     */
    calculateSellTotal() {
        const quantity = parseFloat($('#sell-quantity').val()) || 0;
        const price = parseFloat($('#sell-price').val()) || 0;
        const proceeds = quantity * price;

        // Find the holding to calculate gain
        const holding = this.holdingsData.find(h => h.ticker === this.selectedTickerForSell);
        if (holding) {
            const totalCostBasis = quantity * holding.averageBuyPrice;
            const gain = proceeds - totalCostBasis;

            $('#total-proceeds').val(Formatting.formatCurrency(proceeds));
            $('#estimated-gain').val(Formatting.formatCurrency(gain));
        }
    },

    /**
     * Save sell stock transaction
     */
    async saveSellStock() {
        try {
            if (!FirebaseService.isLoggedIn()) {
                DomUtils.showNotification('Please log in', 'warning');
                return;
            }

            // Validate form
            const formData = DomUtils.getFormData('#sell-stock-form');
            
            if (!formData.quantity || !formData.sellPrice || !formData.saleDate) {
                DomUtils.showNotification('Please fill in all required fields', 'error');
                return;
            }

            const quantity = parseFloat(formData.quantity);
            const holding = this.holdingsData.find(h => h.ticker === this.selectedTickerForSell);

            if (!holding) {
                DomUtils.showNotification('Holding not found', 'error');
                return;
            }

            if (quantity > holding.quantity) {
                DomUtils.showNotification('Cannot sell more than available quantity', 'error');
                return;
            }

            DomUtils.showLoading('Selling stock...');

            const userId = FirebaseService.getCurrentUser().uid;
            const sellPrice = parseFloat(formData.sellPrice);
            const totalProceeds = quantity * sellPrice;
            const totalCostBasis = quantity * holding.averageBuyPrice;
            const gain = totalProceeds - totalCostBasis;

            const soldData = {
                ticker: this.selectedTickerForSell,
                quantity: quantity,
                buyPrice: holding.averageBuyPrice,
                sellPrice: sellPrice,
                totalCostBasis: totalCostBasis,
                totalProceeds: totalProceeds,
                totalGain: gain,
                gainPercent: (gain / totalCostBasis) * 100,
                dateSold: formData.saleDate
            };

            await FirebaseService.addSoldStock(userId, soldData);

            // Update holding (remove sold quantity)
            const newQuantity = holding.quantity - quantity;
            if (newQuantity <= 0) {
                // Remove holding if quantity is 0 or less
                // TODO: Remove holding from database
                devLog(`Holding ${this.selectedTickerForSell} fully sold, marking as completed`);
            } else {
                // Update holding quantity
                const newCostBasis = holding.totalCostBasis - totalCostBasis;
                // TODO: Update holding in database
                devLog(`Updated holding ${this.selectedTickerForSell} quantity to ${newQuantity}`);
            }

            DomUtils.hideLoading();
            DomUtils.showNotification('Stock sold successfully!', 'success');
            DomUtils.hideModal('sell-stock-modal');

            // Reload holdings
            this.loadHoldings();
        } catch (error) {
            devError('Error selling stock:', error);
            DomUtils.hideLoading();
            DomUtils.showNotification('Failed to sell stock', 'error');
        }
    }
};

// Initialize when page is shown
$(document).ready(function() {
    // Override initWalletPage to initialize Wallet module
    const originalInitWalletPage = App.initWalletPage;
    App.initWalletPage = function() {
        Wallet.init();
        originalInitWalletPage.call(this);
    };
});
