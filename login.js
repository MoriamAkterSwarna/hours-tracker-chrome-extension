// Login and Authentication functionality
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkExistingSession();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Sign up form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // Google Sign In
        const googleBtn = document.getElementById('googleSignInBtn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                this.handleGoogleSignIn();
            });
        }
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tab}Form`).classList.add('active');
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            // Show loading state
            this.showLoading(true);

            // Get existing users from storage
            const result = await chrome.storage.local.get(['users']);
            const users = result.users || [];

            // Find user with matching email
            const user = users.find(u => u.email === email);

            if (!user) {
                throw new Error('No account found with this email');
            }

            // Verify password (in a real app, this would be properly hashed)
            if (user.password !== this.hashPassword(password)) {
                throw new Error('Incorrect password');
            }

            // Login successful
            await this.setActiveUser(user);
            this.showSuccess('Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'popup.html';
            }, 1500);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        try {
            // Validation
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Show loading state
            this.showLoading(true);

            // Get existing users
            const result = await chrome.storage.local.get(['users']);
            const users = result.users || [];

            // Check if email already exists
            if (users.find(u => u.email === email)) {
                throw new Error('An account with this email already exists');
            }

            // Create new user
            const newUser = {
                id: this.generateId(),
                name: name,
                email: email,
                password: this.hashPassword(password),
                createdAt: new Date().toISOString(),
                authMethod: 'email'
            };

            // Save user
            users.push(newUser);
            await chrome.storage.local.set({ users });

            // Auto-login after signup
            await this.setActiveUser(newUser);
            this.showSuccess('Account created! Redirecting...');

            setTimeout(() => {
                window.location.href = 'popup.html';
            }, 1500);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleGoogleSignIn() {
        try {
            this.showLoading(true);

            // In a real implementation, you would use Google's OAuth API
            // For this demo, we'll simulate Google login
            const googleUser = await this.simulateGoogleAuth();

            // Get existing users
            const result = await chrome.storage.local.get(['users']);
            const users = result.users || [];

            // Check if Google user already exists
            let user = users.find(u => u.email === googleUser.email);

            if (!user) {
                // Create new user from Google data
                user = {
                    id: this.generateId(),
                    name: googleUser.name,
                    email: googleUser.email,
                    avatar: googleUser.avatar,
                    createdAt: new Date().toISOString(),
                    authMethod: 'google'
                };
                users.push(user);
                await chrome.storage.local.set({ users });
            }

            // Login user
            await this.setActiveUser(user);
            this.showSuccess('Google login successful! Redirecting...');

            setTimeout(() => {
                window.location.href = 'popup.html';
            }, 1500);

        } catch (error) {
            this.showError('Google login failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async simulateGoogleAuth() {
        // Simulate Google OAuth response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'google_' + this.generateId(),
                    name: 'Google User',
                    email: 'user@gmail.com',
                    avatar: 'https://lh3.googleusercontent.com/a/default-user'
                });
            }, 1000);
        });
    }

    async setActiveUser(user) {
        this.currentUser = user;
        await chrome.storage.local.set({ currentUser: user });
    }

    async checkExistingSession() {
        try {
            const result = await chrome.storage.local.get(['currentUser']);
            if (result.currentUser) {
                // User already logged in, redirect to main app
                window.location.href = 'popup.html';
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    hashPassword(password) {
        // Simple hash for demo (in production, use proper hashing)
        return btoa(password + 'salt');
    }

    showLoading(show) {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.disabled = show;
            if (show) {
                btn.textContent = 'Loading...';
            } else {
                // Reset button text based on type
                if (btn.id === 'googleSignInBtn') {
                    btn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    `;
                } else if (btn.form && btn.form.id === 'loginForm') {
                    btn.textContent = 'Login';
                } else if (btn.form && btn.form.id === 'signupForm') {
                    btn.textContent = 'Sign Up';
                }
            }
        });
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existing = document.querySelector('.message');
        if (existing) {
            existing.remove();
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;

        // Add styles
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        if (type === 'error') {
            messageEl.style.background = '#ef4444';
        } else {
            messageEl.style.background = '#10b981';
        }

        document.body.appendChild(messageEl);

        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize immediately when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Apply dark mode by default
  document.body.classList.add('dark-mode');
  new AuthManager();
});
