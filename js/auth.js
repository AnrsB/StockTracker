/* ============================================
   AUTH.JS - Authentication Controller
   ============================================ */

const Auth = {
    initialized: false,

    /**
     * Initialize authentication UI
     */
    init() {
        if (this.initialized) {
            devLog('Auth module already initialized, skipping...');
            return;
        }
        
        this.setupEventHandlers();
        this.initialized = true;
        devLog('Auth module initialized');
    },

    /**
     * Setup event handlers for auth modals
     */
    setupEventHandlers() {
        // Login modal
        $(document).on('click', '#login-btn', () => this.showLoginModal());
        $(document).on('click', '#login-submit', () => this.handleLogin());
        $(document).on('click', '#google-login-btn', () => this.handleGoogleLogin());
        $(document).on('click', '#to-signup-link', () => this.showSignupModal());

        // Signup modal
        $(document).on('click', '#signup-btn', () => this.showSignupModal());
        $(document).on('click', '#signup-submit', () => this.handleSignup());
        $(document).on('click', '#to-login-link', () => this.showLoginModal());

        // Modal close handlers
        DomUtils.setupModalCloseHandlers('login-modal');
        DomUtils.setupModalCloseHandlers('signup-modal');

        // Logout
        $(document).on('click', '#logout-link', () => this.handleLogout());
    },

    /**
     * Show login modal
     */
    showLoginModal() {
        DomUtils.clearForm('#login-form');
        DomUtils.hideModal('signup-modal');
        DomUtils.showModal('login-modal');
    },

    /**
     * Show signup modal
     */
    showSignupModal() {
        DomUtils.clearForm('#signup-form');
        DomUtils.hideModal('login-modal');
        DomUtils.showModal('signup-modal');
    },

    /**
     * Handle email/password login
     */
    async handleLogin() {
        try {
            const email = $('#login-email').val().trim();
            const password = $('#login-password').val();

            // Validation
            if (!email || !password) {
                DomUtils.showNotification('Please fill in all fields', 'warning');
                return;
            }

            if (!this.isValidEmail(email)) {
                DomUtils.showNotification('Please enter a valid email', 'error');
                return;
            }

            DomUtils.showLoading('Logging in...');

            const result = await FirebaseService.login(email, password);

            DomUtils.hideLoading();
            DomUtils.hideModal('login-modal');
            DomUtils.showNotification(`Welcome back, ${email}!`, 'success');

            // Page will reload on auth state change
        } catch (error) {
            DomUtils.hideLoading();
            devError('Login error:', error);
            
            // User-friendly error messages
            let message = 'Login failed';
            if (error.message.includes('user-not-found')) {
                message = 'No account found with this email';
            } else if (error.message.includes('wrong-password')) {
                message = 'Incorrect password';
            } else if (error.message.includes('invalid-email')) {
                message = 'Invalid email format';
            } else if (error.message.includes('user-disabled')) {
                message = 'This account has been disabled';
            }
            
            DomUtils.showNotification(message, 'error');
        }
    },

    /**
     * Handle Google login
     */
    async handleGoogleLogin() {
        try {
            DomUtils.showLoading('Signing in with Google...');

            const result = await FirebaseService.loginWithGoogle();

            DomUtils.hideLoading();
            DomUtils.hideModal('login-modal');
            DomUtils.showNotification(`Welcome, ${result.displayName || result.email}!`, 'success');

            // Page will reload on auth state change
        } catch (error) {
            DomUtils.hideLoading();
            devError('Google login error:', error);

            // Check for specific errors
            if (error.message.includes('popup-closed-by-user')) {
                // User cancelled - no notification needed
                return;
            }

            DomUtils.showNotification('Google login failed', 'error');
        }
    },

    /**
     * Handle email/password signup
     */
    async handleSignup() {
        try {
            const email = $('#signup-email').val().trim();
            const password = $('#signup-password').val();
            const confirmPassword = $('#signup-confirm-password').val();
            const username = $('#signup-username').val().trim();

            // Validation
            if (!email || !password || !confirmPassword || !username) {
                DomUtils.showNotification('Please fill in all fields', 'warning');
                return;
            }

            if (!this.isValidEmail(email)) {
                DomUtils.showNotification('Please enter a valid email', 'error');
                return;
            }

            if (password.length < 6) {
                DomUtils.showNotification('Password must be at least 6 characters', 'error');
                return;
            }

            if (password !== confirmPassword) {
                DomUtils.showNotification('Passwords do not match', 'error');
                return;
            }

            if (username.length < 3) {
                DomUtils.showNotification('Username must be at least 3 characters', 'error');
                return;
            }

            DomUtils.showLoading('Creating account...');

            const result = await FirebaseService.signup(email, password, username);

            DomUtils.hideLoading();
            DomUtils.hideModal('signup-modal');
            DomUtils.showNotification(`Account created successfully! Welcome, ${username}!`, 'success');

            // Page will reload on auth state change
        } catch (error) {
            DomUtils.hideLoading();
            devError('Signup error:', error);

            // User-friendly error messages
            let message = 'Signup failed';
            if (error.message.includes('email-already-in-use')) {
                message = 'This email is already registered';
            } else if (error.message.includes('invalid-email')) {
                message = 'Invalid email format';
            } else if (error.message.includes('weak-password')) {
                message = 'Password is too weak';
            } else if (error.message.includes('operation-not-allowed')) {
                message = 'Account creation is currently disabled';
            }

            DomUtils.showNotification(message, 'error');
        }
    },

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            DomUtils.showLoading('Logging out...');

            await FirebaseService.logout();

            DomUtils.hideLoading();
            DomUtils.showNotification('Logged out successfully', 'success');

            // Reload page to reset state
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            DomUtils.hideLoading();
            devError('Logout error:', error);
            DomUtils.showNotification('Logout failed', 'error');
        }
    },

    /**
     * Simple email validation
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

// Initialize auth module on document ready
$(document).ready(function() {
    Auth.init();
});
