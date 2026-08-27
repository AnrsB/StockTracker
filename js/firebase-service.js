/* ============================================
   FIREBASE-SERVICE.JS - Firebase Operations
   ============================================ */

const FirebaseService = {
    // Initialize Firebase
    init() {
        try {
            // Initialize Firebase with config
            firebase.initializeApp(CONFIG.firebase);
            this.auth = firebase.auth();
            this.database = firebase.database();
            devLog('Firebase initialized successfully');
            return true;
        } catch (error) {
            devError('Firebase initialization error:', error);
            return false;
        }
    },

    // ============================================
    // AUTHENTICATION
    // ============================================

    /**
     * Create a new user account
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} username - Username
     * @returns {Promise<Object>} User data
     */
    async signup(email, password, username) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const userId = userCredential.user.uid;

            // Store user profile in database
            await this.database.ref(`users/${userId}/profile`).set({
                email: email,
                username: username,
                createdDate: new Date().toISOString(),
                lastLoginDate: new Date().toISOString(),
                preferredCurrency: 'USD',
                theme: 'light'
            });

            devLog('User signup successful:', userId);
            return { uid: userId, email: email, username: username };
        } catch (error) {
            devError('Signup error:', error);
            throw new Error(error.message);
        }
    },

    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data
     */
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const userId = userCredential.user.uid;

            // Update last login date
            await this.database.ref(`users/${userId}/profile/lastLoginDate`).set(
                new Date().toISOString()
            );

            devLog('User login successful:', userId);
            return { uid: userId, email: email };
        } catch (error) {
            devError('Login error:', error);
            throw new Error(error.message);
        }
    },

    /**
     * Login with Google
     * @returns {Promise<Object>} User data
     */
    async loginWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await this.auth.signInWithPopup(provider);
            const userId = userCredential.user.uid;
            const user = userCredential.user;

            // Check if user profile exists, create if not
            const profileRef = this.database.ref(`users/${userId}/profile`);
            const snapshot = await profileRef.once('value');
            
            if (!snapshot.exists()) {
                await profileRef.set({
                    email: user.email,
                    username: user.displayName || user.email.split('@')[0],
                    createdDate: new Date().toISOString(),
                    lastLoginDate: new Date().toISOString(),
                    preferredCurrency: 'USD',
                    theme: 'light',
                    photoURL: user.photoURL || ''
                });
            } else {
                // Update last login date
                await profileRef.update({
                    lastLoginDate: new Date().toISOString()
                });
            }

            devLog('Google login successful:', userId);
            return { uid: userId, email: user.email, displayName: user.displayName };
        } catch (error) {
            devError('Google login error:', error);
            throw new Error(error.message);
        }
    },

    /**
     * Logout current user
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            await this.auth.signOut();
            devLog('User logout successful');
        } catch (error) {
            devError('Logout error:', error);
            throw new Error(error.message);
        }
    },

    /**
     * Get currently logged in user
     * @returns {Object|null} User object or null
     */
    getCurrentUser() {
        return this.auth.currentUser;
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.auth.currentUser !== null;
    },

    /**
     * Setup auth state listener
     * @param {Function} callback - Function to call when auth state changes
     */
    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(callback);
    },

    // ============================================
    // WATCHLIST OPERATIONS
    // ============================================

    /**
     * Add stock to user's watchlist
     * @param {string} userId - User ID
     * @param {string} ticker - Stock ticker
     * @param {string} notes - Optional notes
     * @returns {Promise<string>} Watchlist item ID
     */
    async addToWatchlist(userId, ticker, notes = '') {
        try {
            const watchlistRef = this.database.ref(`users/${userId}/watchlist`);
            const newItemRef = watchlistRef.push({
                ticker: ticker,
                addedDate: new Date().toISOString(),
                notes: notes,
                isActive: true
            });
            devLog('Added to watchlist:', ticker);
            return newItemRef.key;
        } catch (error) {
            devError('Error adding to watchlist:', error);
            throw error;
        }
    },

    /**
     * Remove stock from watchlist
     * @param {string} userId - User ID
     * @param {string} watchlistId - Watchlist item ID
     * @returns {Promise<void>}
     */
    async removeFromWatchlist(userId, watchlistId) {
        try {
            await this.database.ref(`users/${userId}/watchlist/${watchlistId}`).remove();
            devLog('Removed from watchlist:', watchlistId);
        } catch (error) {
            devError('Error removing from watchlist:', error);
            throw error;
        }
    },

    /**
     * Get user's watchlist
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of watchlist items
     */
    async getWatchlist(userId) {
        try {
            const snapshot = await this.database.ref(`users/${userId}/watchlist`).once('value');
            const data = snapshot.val();
            return data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
        } catch (error) {
            devError('Error fetching watchlist:', error);
            throw error;
        }
    },

    /**
     * Setup real-time listener for watchlist
     * @param {string} userId - User ID
     * @param {Function} callback - Function to call when watchlist changes
     * @returns {Function} Unsubscribe function
     */
    onWatchlistChange(userId, callback) {
        const ref = this.database.ref(`users/${userId}/watchlist`);
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            const watchlist = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
            callback(watchlist);
        });
        return () => ref.off('value');
    },

    // ============================================
    // HOLDINGS OPERATIONS
    // ============================================

    /**
     * Get user's current holdings
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of holdings
     */
    async getHoldings(userId) {
        try {
            const snapshot = await this.database.ref(`users/${userId}/holdings`).once('value');
            const data = snapshot.val();
            return data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
        } catch (error) {
            devError('Error fetching holdings:', error);
            throw error;
        }
    },

    /**
     * Setup real-time listener for holdings
     * @param {string} userId - User ID
     * @param {Function} callback - Function to call when holdings change
     * @returns {Function} Unsubscribe function
     */
    onHoldingsChange(userId, callback) {
        const ref = this.database.ref(`users/${userId}/holdings`);
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            const holdings = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
            callback(holdings);
        });
        return () => ref.off('value');
    },

    // ============================================
    // TRANSACTION OPERATIONS
    // ============================================

    /**
     * Add a buy transaction
     * @param {string} userId - User ID
     * @param {Object} transactionData - Transaction data
     * @returns {Promise<string>} Transaction ID
     */
    async addTransaction(userId, transactionData) {
        try {
            const txnRef = this.database.ref(`users/${userId}/transactions`);
            const newTxnRef = txnRef.push({
                ...transactionData,
                transactionType: 'BUY',
                createdDate: new Date().toISOString()
            });
            
            // Update or create holding
            await this.updateHolding(userId, transactionData.ticker, transactionData);
            
            devLog('Transaction added:', newTxnRef.key);
            return newTxnRef.key;
        } catch (error) {
            devError('Error adding transaction:', error);
            throw error;
        }
    },

    /**
     * Get user's transactions
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of transactions
     */
    async getTransactions(userId) {
        try {
            const snapshot = await this.database.ref(`users/${userId}/transactions`).once('value');
            const data = snapshot.val();
            return data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
        } catch (error) {
            devError('Error fetching transactions:', error);
            throw error;
        }
    },

    /**
     * Setup real-time listener for transactions
     * @param {string} userId - User ID
     * @param {Function} callback - Function to call when transactions change
     * @returns {Function} Unsubscribe function
     */
    onTransactionsChange(userId, callback) {
        const ref = this.database.ref(`users/${userId}/transactions`);
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            const transactions = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
            callback(transactions);
        });
        return () => ref.off('value');
    },

    // ============================================
    // HOLDINGS CALCULATIONS
    // ============================================

    /**
     * Update holding based on transaction
     * @param {string} userId - User ID
     * @param {string} ticker - Stock ticker
     * @param {Object} transactionData - Transaction data
     * @returns {Promise<void>}
     */
    async updateHolding(userId, ticker, transactionData) {
        try {
            const holdingsRef = this.database.ref(`users/${userId}/holdings`);
            const snapshot = await holdingsRef.once('value');
            const data = snapshot.val();
            
            // Find existing holding for this ticker
            let holdingId = null;
            let existingHolding = null;
            
            if (data) {
                for (let [key, value] of Object.entries(data)) {
                    if (value.ticker === ticker) {
                        holdingId = key;
                        existingHolding = value;
                        break;
                    }
                }
            }

            // Calculate new holding data
            let quantity, averageBuyPrice;
            
            if (existingHolding) {
                // Update existing holding
                const totalShares = existingHolding.quantity + transactionData.quantity;
                const totalCost = (existingHolding.quantity * existingHolding.averageBuyPrice) +
                                 (transactionData.quantity * transactionData.pricePerShare);
                averageBuyPrice = totalCost / totalShares;
                quantity = totalShares;
            } else {
                // Create new holding
                quantity = transactionData.quantity;
                averageBuyPrice = transactionData.pricePerShare;
            }

            const holdingData = {
                ticker: ticker,
                quantity: quantity,
                averageBuyPrice: averageBuyPrice,
                totalCostBasis: quantity * averageBuyPrice,
                lastUpdatedDate: new Date().toISOString(),
                isActive: true
            };

            if (holdingId) {
                // Update existing
                await this.database.ref(`users/${userId}/holdings/${holdingId}`).update(holdingData);
            } else {
                // Create new
                await holdingsRef.push(holdingData);
            }

            devLog('Holding updated:', ticker);
        } catch (error) {
            devError('Error updating holding:', error);
            throw error;
        }
    },

    // ============================================
    // SOLD STOCKS
    // ============================================

    /**
     * Add sold stock record
     * @param {string} userId - User ID
     * @param {Object} soldData - Sold stock data
     * @returns {Promise<string>} Sold stock ID
     */
    async addSoldStock(userId, soldData) {
        try {
            const soldRef = this.database.ref(`users/${userId}/soldStocks`);
            const newSoldRef = soldRef.push({
                ...soldData,
                createdDate: new Date().toISOString()
            });
            devLog('Sold stock added:', newSoldRef.key);
            return newSoldRef.key;
        } catch (error) {
            devError('Error adding sold stock:', error);
            throw error;
        }
    },

    /**
     * Get user's sold stocks
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of sold stocks
     */
    async getSoldStocks(userId) {
        try {
            const snapshot = await this.database.ref(`users/${userId}/soldStocks`).once('value');
            const data = snapshot.val();
            return data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
        } catch (error) {
            devError('Error fetching sold stocks:', error);
            throw error;
        }
    },

    /**
     * Setup real-time listener for sold stocks
     * @param {string} userId - User ID
     * @param {Function} callback - Function to call when sold stocks change
     * @returns {Function} Unsubscribe function
     */
    onSoldStocksChange(userId, callback) {
        const ref = this.database.ref(`users/${userId}/soldStocks`);
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            const soldStocks = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
            callback(soldStocks);
        });
        return () => ref.off('value');
    },

    // ============================================
    // USER PROFILE
    // ============================================

    /**
     * Get user profile
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile data
     */
    async getUserProfile(userId) {
        try {
            const snapshot = await this.database.ref(`users/${userId}/profile`).once('value');
            return snapshot.val();
        } catch (error) {
            devError('Error fetching user profile:', error);
            throw error;
        }
    },

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updates - Profile updates
     * @returns {Promise<void>}
     */
    async updateUserProfile(userId, updates) {
        try {
            await this.database.ref(`users/${userId}/profile`).update(updates);
            devLog('User profile updated');
        } catch (error) {
            devError('Error updating user profile:', error);
            throw error;
        }
    },

    // ============================================
    // ERROR HANDLING
    // ============================================

    /**
     * Handle Firebase errors
     * @param {Error} error - Firebase error
     * @returns {string} User-friendly error message
     */
    handleError(error) {
        devError('Firebase error:', error);
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already in use.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/invalid-email':
                return 'Invalid email address.';
            case 'auth/user-not-found':
                return 'User not found.';
            case 'auth/wrong-password':
                return 'Wrong password.';
            case 'auth/user-disabled':
                return 'User account is disabled.';
            default:
                return error.message || 'An error occurred. Please try again.';
        }
    }
};

// Initialize Firebase when document is ready
$(document).ready(function() {
    FirebaseService.init();
});
