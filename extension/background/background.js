// =====================================================
//  UPDATED BACKGROUND SCRIPT - Global Database Support
// =====================================================

class BackgroundService {
  constructor() {
    this.API_BASE_URL = 'https://jobtracker-api-b08390fc29d1.herokuapp.com/api'; // Use production URL
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
          const result = await this.saveJobToGlobalDatabase(request.jobData);
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
          
        case 'GET_GLOBAL_JOBS':
          const jobs = await this.getGlobalJobs(request.filters);
          sendResponse({ success: true, data: jobs });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // NEW METHOD: Save job to global database (no auth required)
  async saveJobToGlobalDatabase(jobData) {
    console.log('🌍 Saving job to global database:', jobData);
    
    // Add extension metadata
    const enhancedJobData = {
      ...jobData,
      extracted_data: {
        ...jobData.extracted_data,
        extension_version: chrome.runtime.getManifest().version,
        extraction_timestamp: new Date().toISOString(),
        page_url: jobData.extracted_data?.page_url || jobData.url,
        user_agent: navigator.userAgent
      }
    };

    console.log('📤 Making API request to:', `${this.API_BASE_URL}/global/jobs`);
    console.log('📝 Request payload:', enhancedJobData);

    try {
      const response = await fetch(`${this.API_BASE_URL}/global/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enhancedJobData)
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response not OK. Status:', response.status);
        console.error('❌ Response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Job saved successfully:', result);
      return result;
    } catch (error) {
      console.error('💥 Fetch error details:');
      console.error('   Error type:', error.constructor.name);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      
      // Check if it's a network error
      if (error.message.includes('fetch')) {
        console.error('   This looks like a network/CORS error');
      }
      
      throw error;
    }
  }

  // NEW METHOD: Get jobs from global database
  async getGlobalJobs(filters = {}) {
    const params = new URLSearchParams(filters);
    
    const response = await fetch(`${this.API_BASE_URL}/global/jobs?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch global jobs');
    }

    return await response.json();
  }

  // Keep existing methods for user-specific functionality
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
        url: 'https://job-tracker-weld-three.vercel.app' // Use production URL
      });
    }
  }
}

// Initialize background service
new BackgroundService();
