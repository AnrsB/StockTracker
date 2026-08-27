/* ============================================
   DOM-UTILS.JS - DOM Manipulation Utilities
   ============================================ */

const DomUtils = {
    // ============================================
    // MODAL HELPERS
    // ============================================

    /**
     * Show modal by ID
     * @param {string} modalId - Modal element ID
     */
    showModal(modalId) {
        const $modal = $(`#${modalId}`);
        if ($modal.length) {
            $modal.addClass('active').fadeIn(300);
            $('body').addClass('modal-open');
            devLog(`Modal shown: ${modalId}`);
        } else {
            devError(`Modal not found: ${modalId}`);
        }
    },

    /**
     * Hide modal by ID
     * @param {string} modalId - Modal element ID
     */
    hideModal(modalId) {
        const $modal = $(`#${modalId}`);
        if ($modal.length) {
            $modal.removeClass('active').fadeOut(300);
            $('body').removeClass('modal-open');
            devLog(`Modal hidden: ${modalId}`);
        }
    },

    /**
     * Toggle modal visibility
     * @param {string} modalId - Modal element ID
     */
    toggleModal(modalId) {
        const $modal = $(`#${modalId}`);
        if ($modal.hasClass('active')) {
            this.hideModal(modalId);
        } else {
            this.showModal(modalId);
        }
    },

    /**
     * Setup modal close handlers
     * @param {string} modalId - Modal element ID
     */
    setupModalCloseHandlers(modalId) {
        const $modal = $(`#${modalId}`);
        
        // Close on backdrop click
        $modal.on('click', function(e) {
            if (e.target === this) {
                DomUtils.hideModal(modalId);
            }
        });

        // Close on close button
        $modal.find('.modal-close').on('click', function() {
            DomUtils.hideModal(modalId);
        });
    },

    // ============================================
    // NOTIFICATION HELPERS
    // ============================================

    /**
     * Show notification toast
     * @param {string} message - Notification message
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Display duration in milliseconds
     */
    showNotification(message, type = 'info', duration = null) {
        duration = duration || CONFIG.ui.toastDuration;

        const id = `notification-${Date.now()}`;
        const icon = this.getNotificationIcon(type);
        
        const $notification = $(`
            <div class="notification notification-${type}" id="${id}">
                <i class="fas ${icon}"></i>
                <span class="notification-message">${this.escapeHtml(message)}</span>
                <button class="notification-close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);

        // Add to notifications container
        const $container = $('.notifications-container');
        if ($container.length) {
            $container.append($notification);
        } else {
            $('body').append($(`<div class="notifications-container"></div>`).append($notification));
        }

        // Setup close handler
        $notification.find('.notification-close').on('click', function() {
            $notification.fadeOut(300, function() {
                $(this).remove();
            });
        });

        // Auto dismiss
        setTimeout(() => {
            $notification.fadeOut(300, function() {
                $(this).remove();
            });
        }, duration);

        devLog(`Notification shown: ${type} - ${message}`);
    },

    /**
     * Get icon class for notification type
     * @param {string} type - Notification type
     * @returns {string} Font Awesome icon class
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    },

    // ============================================
    // LOADING HELPERS
    // ============================================

    /**
     * Show loading indicator
     * @param {string} message - Optional loading message
     */
    showLoading(message = 'Loading...') {
        const $loading = $('.loading-indicator');
        if ($loading.length) {
            $loading.find('p').text(message);
            $loading.fadeIn(300);
        }
    },

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const $loading = $('.loading-indicator');
        if ($loading.length) {
            $loading.fadeOut(300);
        }
    },

    // ============================================
    // STOCK CARD HELPERS
    // ============================================

    /**
     * Create stock card HTML
     * @param {Object} stock - Stock data object
     * @returns {string} HTML string
     */
    createStockCard(stock) {
        const changeClass = stock.change >= 0 ? 'positive' : 'negative';
        const changeIcon = stock.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        const changePercent = stock.changePercent ? stock.changePercent.toFixed(2) : '0.00';
        
        return `
            <div class="stock-card" data-ticker="${stock.ticker}">
                <div class="stock-card-header">
                    <div class="stock-card-title">
                        <div class="stock-card-ticker">${this.escapeHtml(stock.ticker)}</div>
                        <div class="stock-card-name">${this.escapeHtml(stock.name)}</div>
                        ${stock.sector ? `<span class="stock-card-sector">${this.escapeHtml(stock.sector)}</span>` : ''}
                    </div>
                </div>
                <div class="stock-card-price">${this.formatCurrency(stock.price)}</div>
                <div class="stock-card-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    <span>${this.formatCurrency(stock.change)} (${changePercent}%)</span>
                </div>
                <div class="stock-card-action">
                    <button class="btn btn-primary view-details" data-ticker="${stock.ticker}">View Details</button>
                    <button class="btn btn-secondary add-watchlist" data-ticker="${stock.ticker}">Add to Watchlist</button>
                </div>
            </div>
        `;
    },

    /**
     * Render stock cards to container
     * @param {string} containerId - Container element ID
     * @param {Array} stocks - Array of stock objects
     */
    renderStockCards(containerId, stocks) {
        const $container = $(`#${containerId}`);
        if (!$container.length) {
            devError(`Container not found: ${containerId}`);
            return;
        }

        if (!stocks || stocks.length === 0) {
            $container.html(`
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No stocks found</h3>
                    <p>Try searching for a different ticker or company name.</p>
                </div>
            `);
            return;
        }

        const html = stocks.map(stock => this.createStockCard(stock)).join('');
        $container.html(html);
        devLog(`Rendered ${stocks.length} stock cards`);
    },

    // ============================================
    // TABLE HELPERS
    // ============================================

    /**
     * Update table with data rows
     * @param {string} tableSelector - Table jQuery selector
     * @param {Array} data - Array of row data objects
     * @param {Array} columns - Array of column definitions
     */
    updateTable(tableSelector, data, columns) {
        const $table = $(tableSelector);
        if (!$table.length) {
            devError(`Table not found: ${tableSelector}`);
            return;
        }

        const $tbody = $table.find('tbody');
        if (!$tbody.length) {
            devError(`Table body not found in ${tableSelector}`);
            return;
        }

        if (!data || data.length === 0) {
            $tbody.html(`
                <tr>
                    <td colspan="${columns.length}" style="text-align: center; padding: 2rem;">
                        No data available
                    </td>
                </tr>
            `);
            return;
        }

        const rows = data.map(row => {
            const cells = columns.map(col => {
                const value = this.getNestedProperty(row, col.field);
                const formatted = col.format ? col.format(value, row) : value;
                return `<td data-label="${col.label}">${this.escapeHtml(formatted)}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        $tbody.html(rows);
        devLog(`Updated table with ${data.length} rows`);
    },

    /**
     * Get nested property from object
     * @param {Object} obj - Object
     * @param {string} path - Property path (e.g., 'user.name')
     * @returns {*} Property value
     */
    getNestedProperty(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    },

    // ============================================
    // FORM HELPERS
    // ============================================

    /**
     * Get form data as object
     * @param {string} formSelector - Form jQuery selector
     * @returns {Object} Form data
     */
    getFormData(formSelector) {
        const $form = $(formSelector);
        const formData = {};

        $form.find('input, select, textarea').each(function() {
            const $field = $(this);
            const name = $field.attr('name');
            const value = $field.val();

            if (name) {
                if ($field.attr('type') === 'checkbox') {
                    formData[name] = $field.is(':checked');
                } else if ($field.attr('type') === 'number') {
                    formData[name] = value ? parseFloat(value) : null;
                } else {
                    formData[name] = value;
                }
            }
        });

        return formData;
    },

    /**
     * Fill form with data
     * @param {string} formSelector - Form jQuery selector
     * @param {Object} data - Data object
     */
    fillForm(formSelector, data) {
        const $form = $(formSelector);

        Object.keys(data).forEach(key => {
            const $field = $form.find(`[name="${key}"]`);
            if ($field.length) {
                if ($field.attr('type') === 'checkbox') {
                    $field.prop('checked', data[key]);
                } else {
                    $field.val(data[key]);
                }
            }
        });
    },

    /**
     * Clear form
     * @param {string} formSelector - Form jQuery selector
     */
    clearForm(formSelector) {
        const $form = $(formSelector);
        $form[0].reset();
        $form.find('.form-group').removeClass('error');
        $form.find('.form-error').hide();
    },

    /**
     * Show form validation error
     * @param {string} fieldName - Field name
     * @param {string} formSelector - Form jQuery selector
     * @param {string} message - Error message
     */
    showFieldError(fieldName, formSelector, message) {
        const $form = $(formSelector);
        const $field = $form.find(`[name="${fieldName}"]`);
        const $group = $field.closest('.form-group');

        $group.addClass('error');
        $group.find('.form-error').text(message).show();
    },

    /**
     * Clear form validation error
     * @param {string} fieldName - Field name
     * @param {string} formSelector - Form jQuery selector
     */
    clearFieldError(fieldName, formSelector) {
        const $form = $(formSelector);
        const $field = $form.find(`[name="${fieldName}"]`);
        const $group = $field.closest('.form-group');

        $group.removeClass('error');
        $group.find('.form-error').hide();
    },

    // ============================================
    // FORMATTING HELPERS
    // ============================================

    /**
     * Format number as currency
     * @param {number} value - Value to format
     * @param {string} symbol - Currency symbol
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted currency
     */
    formatCurrency(value, symbol = '$', decimals = 2) {
        if (value === null || value === undefined) return `${symbol}0.00`;
        return symbol + parseFloat(value).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Format date
     * @param {Date|string} date - Date to format
     * @param {string} format - Format string (simple: 'short', 'long', 'time')
     * @returns {string} Formatted date
     */
    formatDate(date, format = 'short') {
        if (!date) return '';
        const d = new Date(date);
        
        switch (format) {
            case 'short':
                return d.toLocaleDateString();
            case 'long':
                return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            case 'time':
                return d.toLocaleTimeString();
            default:
                return d.toString();
        }
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
};
