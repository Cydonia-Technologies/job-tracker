class PopupManager {
  constructor() {
    this.API_BASE_URL = 'http://localhost:3001/api';
    this.init();
  }

  async init() {
    // Check current auth status
    const authStatus = await this.checkAuthStatus();
    this.updateUI(authStatus);
    
    // Bind events
    document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
    document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
    document.getElementById('openWebApp').addEventListener('click', () => this.openWebApp());
    document.getElementById('registerBtn').addEventListener('click', () => this.showRegisterForm());
    document.getElementById('submitRegister').addEventListener('click', () => this.handleRegister());
    document.getElementById('backToLogin').addEventListener('click', () => this.showLoginForm());

  }

  async checkAuthStatus() {
    try {
      const token = await this.getStoredToken();
      if (!token) return { authenticated: false };

      // Verify token with backend
      const response = await fetch(`${this.API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        return { authenticated: true, user: userData.user };
      } else {
        // Token invalid, remove it
        await this.removeStoredToken();
        return { authenticated: false };
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return { authenticated: false, error: error.message };
    }
  }

  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');

    if (!email || !password) {
      this.showStatus('Please enter email and password', 'error');
      return;
    }

    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token
        await this.storeToken(data.session.access_token);
        
        this.showStatus('Login successful!', 'success');
        this.updateUI({ authenticated: true, user: data.user });
        
        // Clear form
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
      } else {
        this.showStatus(data.error || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showStatus('Network error: ' + error.message, 'error');
    } finally {
      loginBtn.textContent = 'Login';
      loginBtn.disabled = false;
    }
  }

  async handleLogout() {
    try {
      const token = await this.getStoredToken();
      
      // Call logout endpoint
      if (token) {
        await fetch(`${this.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      // Remove stored token
      await this.removeStoredToken();
      
      this.showStatus('Logged out successfully', 'info');
      this.updateUI({ authenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
      this.showStatus('Logout error: ' + error.message, 'error');
    }
  }

  openWebApp() {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  }

  updateUI(authStatus) {
    const loginSection = document.getElementById('loginSection');
    const loggedInSection = document.getElementById('loggedInSection');
    const userEmail = document.getElementById('userEmail');

    if (authStatus.authenticated) {
      loginSection.style.display = 'none';
      loggedInSection.style.display = 'block';
      userEmail.textContent = authStatus.user?.email || 'Unknown user';
    } else {
      loginSection.style.display = 'block';
      loggedInSection.style.display = 'none';
    }
  }

  showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // Clear after 3 seconds
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 3000);
  }

  async storeToken(token) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ 'authToken': token }, resolve);
    });
  }

  async getStoredToken() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['authToken'], (result) => {
        resolve(result.authToken);
      });
    });
  }

  async removeStoredToken() {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(['authToken'], resolve);
    });
  }
    showRegisterForm() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'block';
}

showLoginForm() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('registerSection').style.display = 'none';
}

  async handleRegister() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const submitBtn = document.getElementById('submitRegister');
  
    if (!firstName || !lastName || !email || !password) {
      this.showStatus('Please fill in all fields', 'error');
      return;
    }
  
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
  
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        this.showStatus('Account created! Please login.', 'success');
        this.showLoginForm();
  
        // Pre-fill login form
        document.getElementById('email').value = email;
      } else {
        this.showStatus(data.error || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showStatus('Network error: ' + error.message, 'error');
    } finally {
      submitBtn.textContent = 'Create Account';
      submitBtn.disabled = false;
    }
  }
}

// Initialize when popup opens
new PopupManager();
