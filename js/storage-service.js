/* ============================================
   STORAGE-SERVICE.JS - Cache Management
   ============================================ */

const StorageService = {
    // Storage prefix to avoid collisions
    prefix: 'st_',

    /**
     * Set cache with TTL
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttlMs - Time to live in milliseconds
     */
    setCache(key, value, ttlMs = null) {
        try {
            const cacheKey = this.prefix + key;
            const cacheData = {
                value: value,
                timestamp: Date.now(),
                ttl: ttlMs,
                expires: ttlMs ? Date.now() + ttlMs : null
            };
            
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            devLog(`Cache set: ${key}`);
        } catch (error) {
            devError(`Error setting cache for ${key}:`, error);
        }
    },

    /**
     * Get cache if not expired
     * @param {string} key - Cache key
     * @returns {*|null} Cached value or null if expired/not found
     */
    getCache(key) {
        try {
            const cacheKey = this.prefix + key;
            const cacheJson = localStorage.getItem(cacheKey);
            
            if (!cacheJson) {
                return null;
            }

            const cacheData = JSON.parse(cacheJson);
            
            // Check if cache has expired
            if (cacheData.expires && Date.now() > cacheData.expires) {
                this.removeCache(key);
                devLog(`Cache expired: ${key}`);
                return null;
            }

            devLog(`Cache hit: ${key}`);
            return cacheData.value;
        } catch (error) {
            devError(`Error getting cache for ${key}:`, error);
            return null;
        }
    },

    /**
     * Remove specific cache entry
     * @param {string} key - Cache key
     */
    removeCache(key) {
        try {
            const cacheKey = this.prefix + key;
            localStorage.removeItem(cacheKey);
            devLog(`Cache removed: ${key}`);
        } catch (error) {
            devError(`Error removing cache for ${key}:`, error);
        }
    },

    /**
     * Clear all app cache
     */
    clearAllCache() {
        try {
            const keys = Object.keys(localStorage);
            for (let key of keys) {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            }
            devLog('All cache cleared');
        } catch (error) {
            devError('Error clearing cache:', error);
        }
    },

    /**
     * Check if price cache for ticker is expired
     * @param {string} ticker - Stock ticker
     * @returns {boolean} True if expired or not cached
     */
    isPriceExpired(ticker) {
        const cached = localStorage.getItem(this.prefix + `quote_${ticker}`);
        if (!cached) return true;

        try {
            const data = JSON.parse(cached);
            if (data.expires && Date.now() > data.expires) {
                return true;
            }
            return false;
        } catch {
            return true;
        }
    },

    /**
     * Check if company info cache for ticker is expired
     * @param {string} ticker - Stock ticker
     * @returns {boolean} True if expired or not cached
     */
    isCompanyExpired(ticker) {
        const cached = localStorage.getItem(this.prefix + `company_${ticker}`);
        if (!cached) return true;

        try {
            const data = JSON.parse(cached);
            if (data.expires && Date.now() > data.expires) {
                return true;
            }
            return false;
        } catch {
            return true;
        }
    },

    /**
     * Get cache TTL remaining
     * @param {string} key - Cache key
     * @returns {number|null} Milliseconds remaining or null
     */
    getCacheTTL(key) {
        try {
            const cacheKey = this.prefix + key;
            const cacheJson = localStorage.getItem(cacheKey);
            
            if (!cacheJson) {
                return null;
            }

            const cacheData = JSON.parse(cacheJson);
            
            if (!cacheData.expires) {
                return null; // No expiration
            }

            const remaining = cacheData.expires - Date.now();
            return remaining > 0 ? remaining : 0;
        } catch (error) {
            devError(`Error getting cache TTL for ${key}:`, error);
            return null;
        }
    },

    /**
     * Get cache stats
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        try {
            const keys = Object.keys(localStorage);
            const stats = {
                totalItems: 0,
                expiredItems: 0,
                activeItems: 0,
                totalSize: 0
            };

            for (let key of keys) {
                if (key.startsWith(this.prefix)) {
                    const value = localStorage.getItem(key);
                    stats.totalItems++;
                    stats.totalSize += value.length;

                    try {
                        const data = JSON.parse(value);
                        if (data.expires && Date.now() > data.expires) {
                            stats.expiredItems++;
                        } else {
                            stats.activeItems++;
                        }
                    } catch {
                        stats.activeItems++;
                    }
                }
            }

            return stats;
        } catch (error) {
            devError('Error getting cache stats:', error);
            return null;
        }
    },

    /**
     * Cleanup expired cache entries
     */
    cleanupExpiredCache() {
        try {
            const keys = Object.keys(localStorage);
            let cleaned = 0;

            for (let key of keys) {
                if (key.startsWith(this.prefix)) {
                    const cacheJson = localStorage.getItem(key);
                    try {
                        const data = JSON.parse(cacheJson);
                        if (data.expires && Date.now() > data.expires) {
                            localStorage.removeItem(key);
                            cleaned++;
                        }
                    } catch {
                        // Invalid JSON, remove it
                        localStorage.removeItem(key);
                        cleaned++;
                    }
                }
            }

            devLog(`Cache cleanup: ${cleaned} expired entries removed`);
        } catch (error) {
            devError('Error cleaning up cache:', error);
        }
    },

    // ============================================
    // LOCAL STORAGE METHODS
    // ============================================

    /**
     * Save data to localStorage (persistent, no TTL)
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    setLocal(key, value) {
        try {
            const storageKey = this.prefix + key;
            localStorage.setItem(storageKey, JSON.stringify(value));
            devLog(`Local storage set: ${key}`);
        } catch (error) {
            devError(`Error setting local storage for ${key}:`, error);
        }
    },

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {*|null} Stored value or null
     */
    getLocal(key) {
        try {
            const storageKey = this.prefix + key;
            const value = localStorage.getItem(storageKey);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            devError(`Error getting local storage for ${key}:`, error);
            return null;
        }
    },

    /**
     * Remove from localStorage
     * @param {string} key - Storage key
     */
    removeLocal(key) {
        try {
            const storageKey = this.prefix + key;
            localStorage.removeItem(storageKey);
            devLog(`Local storage removed: ${key}`);
        } catch (error) {
            devError(`Error removing local storage for ${key}:`, error);
        }
    },

    /**
     * Clear all localStorage data for app
     */
    clearAllLocal() {
        try {
            const keys = Object.keys(localStorage);
            for (let key of keys) {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            }
            devLog('All local storage cleared');
        } catch (error) {
            devError('Error clearing local storage:', error);
        }
    },

    // ============================================
    // SESSION STORAGE METHODS
    // ============================================

    /**
     * Save data to sessionStorage (temporary, cleared on close)
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    setSession(key, value) {
        try {
            const storageKey = this.prefix + key;
            sessionStorage.setItem(storageKey, JSON.stringify(value));
            devLog(`Session storage set: ${key}`);
        } catch (error) {
            devError(`Error setting session storage for ${key}:`, error);
        }
    },

    /**
     * Get data from sessionStorage
     * @param {string} key - Storage key
     * @returns {*|null} Stored value or null
     */
    getSession(key) {
        try {
            const storageKey = this.prefix + key;
            const value = sessionStorage.getItem(storageKey);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            devError(`Error getting session storage for ${key}:`, error);
            return null;
        }
    },

    /**
     * Remove from sessionStorage
     * @param {string} key - Storage key
     */
    removeSession(key) {
        try {
            const storageKey = this.prefix + key;
            sessionStorage.removeItem(storageKey);
            devLog(`Session storage removed: ${key}`);
        } catch (error) {
            devError(`Error removing session storage for ${key}:`, error);
        }
    }
};
