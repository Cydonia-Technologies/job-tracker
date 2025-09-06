// =====================================================
// CONTENT SCRIPT - Main Controller
// =====================================================

// content/content.js
class JobTrackerContent {
  constructor() {
    this.currentSite = this.detectSite();
    this.extractor = this.getExtractor();
    this.overlay = null;
    
    if (this.extractor) {
      this.initialize();
    }
  }

  detectSite() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    if (hostname.includes('indeed.com')) {
      return 'indeed';
    } else if (hostname.includes('linkedin.com') && pathname.includes('/jobs/')) {
      return 'linkedin';
    } else if (hostname.includes('psu.edu') || hostname.includes('handshake.com')) {
      return 'nittany';
    }
    
    return null;
  }

  getExtractor() {
    switch (this.currentSite) {
      case 'indeed':
        return window.IndeedExtractor ? new window.IndeedExtractor() : null;
      case 'linkedin':
        return window.LinkedInExtractor ? new window.LinkedInExtractor() : null;
      case 'nittany':
        return window.NittanyExtractor ? new window.NittanyExtractor() : null;
      default:
        return null;
    }
  }

  async initialize() {
    // Wait for page to load completely
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    // Check if user is authenticated
    const authStatus = await this.sendMessage({ action: 'CHECK_AUTH' });
    
    if (!authStatus.success || !authStatus.data.authenticated) {
      this.showLoginPrompt();
      return;
    }

    // Try to extract job data
    const jobData = await this.extractJobData();
    
    if (jobData) {
      this.showSaveOverlay(jobData);
    }

    // Listen for URL changes (for SPAs like LinkedIn)
    this.observeURLChanges();
  }

  async extractJobData() {
    if (!this.extractor) {
      return null;
    }

    try {
      return await this.extractor.extract();
    } catch (error) {
      console.error('Job extraction error:', error);
      return null;
    }
  }

  showSaveOverlay(jobData) {
    if (this.overlay) {
      this.overlay.remove();
    }

    this.overlay = new JobSaveOverlay(jobData, this.saveJob.bind(this));
    this.overlay.show();
  }

  showLoginPrompt() {
    // Create a simple login prompt overlay
    const loginOverlay = document.createElement('div');
    loginOverlay.className = 'job-tracker-login-prompt';
    loginOverlay.innerHTML = `
      <div class="login-content">
        <h3>Job Tracker</h3>
        <p>Please log in to save jobs</p>
        <button id="login-btn">Open Login</button>
        <button id="dismiss-btn">Dismiss</button>
      </div>
    `;
    
    document.body.appendChild(loginOverlay);
    
    // Add event listeners
    loginOverlay.querySelector('#login-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000/login' });
      loginOverlay.remove();
    });
    
    loginOverlay.querySelector('#dismiss-btn').addEventListener('click', () => {
      loginOverlay.remove();
    });
  }

  async saveJob(jobData) {
    try {
      const result = await this.sendMessage({ 
        action: 'SAVE_JOB', 
        jobData: jobData 
      });
      
      if (result.success) {
        this.showSuccessMessage('Job saved successfully!');
        this.updateBadge();
      } else {
        this.showErrorMessage(result.error || 'Failed to save job');
      }
    } catch (error) {
      this.showErrorMessage('Error saving job: ' + error.message);
    }
  }

  async sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }

  showSuccessMessage(message) {
    this.showToast(message, 'success');
  }

  showErrorMessage(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `job-tracker-toast job-tracker-toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  async updateBadge() {
    // Get current job count and update badge
    await this.sendMessage({ action: 'UPDATE_BADGE', count: 1 });
  }

  observeURLChanges() {
    // Watch for URL changes (important for SPAs)
    let currentURL = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentURL) {
        currentURL = window.location.href;
        setTimeout(() => this.setup(), 1000); // Re-initialize after URL change
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize when script loads
new JobTrackerContent();

