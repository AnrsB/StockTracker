/* ============================================
   FORMATTING.JS - Data Formatting Utilities
   ============================================ */

const Formatting = {
    /**
     * Format number as currency
     * @param {number} value - Value to format
     * @param {number} decimals - Number of decimal places
     * @param {string} symbol - Currency symbol
     * @returns {string} Formatted currency
     */
    formatCurrency(value, decimals = 2, symbol = '$') {
        if (value === null || value === undefined) {
            return `${symbol}0.${'0'.repeat(decimals)}`;
        }
        
        const formatted = parseFloat(value).toFixed(decimals);
        const [intPart, decPart] = formatted.split('.');
        const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        return `${symbol}${intFormatted}.${decPart}`;
    },

    /**
     * Format number as percentage
     * @param {number} value - Value to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted percentage
     */
    formatPercent(value, decimals = 2) {
        if (value === null || value === undefined) {
            return `0.${'0'.repeat(decimals)}%`;
        }
        
        return parseFloat(value).toFixed(decimals) + '%';
    },

    /**
     * Format date
     * @param {Date|string|number} date - Date to format
     * @param {string} format - Format type: 'short', 'long', 'full', 'iso', 'time'
     * @returns {string} Formatted date
     */
    formatDate(date, format = 'short') {
        if (!date) return '';
        
        const d = date instanceof Date ? date : new Date(date);
        
        if (isNaN(d.getTime())) {
            return 'Invalid Date';
        }

        switch (format) {
            case 'short':
                // MM/DD/YYYY
                return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
            
            case 'long':
                // January 15, 2024
                const months = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
                return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
            
            case 'full':
                // Monday, January 15, 2024
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const months2 = ['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'];
                return `${days[d.getDay()]}, ${months2[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
            
            case 'iso':
                // 2024-01-15
                return d.toISOString().split('T')[0];
            
            case 'time':
                // 14:30:45
                return d.toLocaleTimeString('en-US', { hour12: false });
            
            default:
                return d.toString();
        }
    },

    /**
     * Format time
     * @param {Date|string|number} time - Time to format
     * @param {string} format - Format type: 'short', 'long', 'iso'
     * @returns {string} Formatted time
     */
    formatTime(time, format = 'short') {
        if (!time) return '';
        
        const d = time instanceof Date ? time : new Date(time);
        
        if (isNaN(d.getTime())) {
            return 'Invalid Time';
        }

        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        switch (format) {
            case 'short':
                // 14:30
                return `${hours}:${minutes}`;
            
            case 'long':
                // 14:30:45
                return `${hours}:${minutes}:${seconds}`;
            
            case 'ampm':
                // 2:30 PM
                const hour12 = d.getHours() % 12 || 12;
                const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
                return `${hour12}:${minutes} ${ampm}`;
            
            case 'iso':
                return d.toISOString();
            
            default:
                return d.toLocaleTimeString();
        }
    },

    /**
     * Format datetime
     * @param {Date|string|number} dateTime - DateTime to format
     * @returns {string} Formatted datetime
     */
    formatDateTime(dateTime) {
        if (!dateTime) return '';
        
        const d = dateTime instanceof Date ? dateTime : new Date(dateTime);
        
        if (isNaN(d.getTime())) {
            return 'Invalid DateTime';
        }

        const date = this.formatDate(d, 'short');
        const time = this.formatTime(d, 'short');
        
        return `${date} ${time}`;
    },

    /**
     * Get CSS class for positive/negative values
     * @param {number} value - Value to evaluate
     * @returns {string} CSS class name
     */
    getColorClass(value) {
        if (value === null || value === undefined || value === 0) {
            return 'text-neutral';
        }
        return value > 0 ? 'text-success' : 'text-danger';
    },

    /**
     * Get color value for positive/negative values
     * @param {number} value - Value to evaluate
     * @returns {string} Color hex value
     */
    getColor(value) {
        if (value === null || value === undefined || value === 0) {
            return '#6B7280'; // Gray
        }
        return value > 0 ? '#16A34A' : '#DC2626'; // Green or Red
    },

    /**
     * Format price with proper decimals
     * @param {number} price - Price value
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted price
     */
    formatPrice(price, decimals = 2) {
        if (price === null || price === undefined) {
            return '0.00';
        }
        return parseFloat(price).toFixed(decimals);
    },

    /**
     * Format number with commas
     * @param {number} value - Value to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number
     */
    formatNumber(value, decimals = 0) {
        if (value === null || value === undefined) {
            return '0';
        }
        
        const formatted = parseFloat(value).toFixed(decimals);
        const [intPart, decPart] = formatted.split('.');
        const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        return decimals > 0 ? `${intFormatted}.${decPart}` : intFormatted;
    },

    /**
     * Format change with icon
     * @param {number} value - Change value
     * @returns {string} Formatted change with HTML
     */
    formatChangeWithIcon(value) {
        if (value === null || value === undefined) {
            return '<i class="fas fa-minus"></i> 0.00%';
        }
        
        const formatted = parseFloat(value).toFixed(2);
        const icon = value > 0 ? 'fa-arrow-up' : value < 0 ? 'fa-arrow-down' : 'fa-minus';
        const className = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
        
        return `<span class="${className}"><i class="fas ${icon}"></i> ${formatted}%</span>`;
    },

    /**
     * Format gain/loss
     * @param {number} gain - Gain value
     * @param {number} gainPercent - Gain percentage
     * @returns {Object} Formatted gain and percent
     */
    formatGainLoss(gain, gainPercent) {
        return {
            gain: this.formatCurrency(gain),
            gainPercent: this.formatPercent(gainPercent),
            className: gain > 0 ? 'positive' : gain < 0 ? 'negative' : 'neutral',
            icon: gain > 0 ? 'fa-arrow-up' : gain < 0 ? 'fa-arrow-down' : 'fa-minus'
        };
    },

    /**
     * Format quantity (shares)
     * @param {number} quantity - Quantity value
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted quantity
     */
    formatQuantity(quantity, decimals = 4) {
        if (quantity === null || quantity === undefined) {
            return '0';
        }
        return parseFloat(quantity).toFixed(decimals).replace(/\.?0+$/, '');
    },

    /**
     * Format time ago (e.g., "2 hours ago")
     * @param {Date|string|number} date - Date to format
     * @returns {string} Time ago string
     */
    formatTimeAgo(date) {
        if (!date) return '';
        
        const d = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const seconds = Math.floor((now - d) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
        
        const years = Math.floor(days / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    },

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
};
