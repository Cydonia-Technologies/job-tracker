// =====================================================
// 2. BACKGROUND SCRIPT - API Communication
// =====================================================

class BackgroundService {
  constructor() {
    this.API_BASE_URL = 'http://localhost:3001/api';
    this.initializeListeners();
  }

  initializeListeners() {
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Indicates async response
    });

    // Listen for extension installation
    chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'SAVE_JOB':
          const result = await this.saveJob(request.jobData);
          sendResponse({ success: true, data: result });
          break;
          
        case 'GET_USER_PROFILE':
          const profile = await this.getUserProfile();
          sendResponse({ success: true, data: profile });
          break;
          
        case 'CHECK_AUTH':
          const authStatus = await this.checkAuthStatus();
          sendResponse({ success: true, data: authStatus });
          break;
          
        case 'UPDATE_BADGE':
          this.updateBadge(request.count);
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async saveJob(jobData) {
    const token = await this.getAuthToken();
    
    if (!token) {
      throw new Error('Not authenticated. Please log in to the web app first.');
    }

    const response = await fetch(`${this.API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jobData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save job');
    }

    return await response.json();
  }

  async getUserProfile() {
    const token = await this.getAuthToken();
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${this.API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }

  async checkAuthStatus() {
    const token = await this.getAuthToken();
    
    if (!token) {
      return { authenticated: false };
    }

    const response = await fetch(`${this.API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return { 
      authenticated: response.ok,
      token: token
    };
  }

  async getAuthToken() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['authToken'], (result) => {
        resolve(result.authToken);
      });
    });
  }

  updateBadge(count) {
    chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : ''
    });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  }

  handleInstall(details) {
    if (details.reason === 'install') {
      chrome.tabs.create({
        url: 'http://localhost:3000/welcome'
      });
    }
  }
}

// Initialize background service
new BackgroundService();

