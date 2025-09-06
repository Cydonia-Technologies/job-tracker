// utils/api.js
window.JobTrackerAPI = {
  async makeRequest(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    const response = await fetch(`${window.JOB_TRACKER_CONSTANTS.API_BASE_URL}${endpoint}`, finalOptions);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }
    
    return await response.json();
  },
  
  async getAuthToken() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([window.JOB_TRACKER_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN], (result) => {
        resolve(result[window.JOB_TRACKER_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN]);
      });
    });
  }
};

