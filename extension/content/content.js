// =====================================================
// UPDATED CONTENT SCRIPT - Global Database Support
// =====================================================

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
    console.log('🚀 JobTracker: Setting up global job extraction...');

    // Try to extract job data
    const jobData = await this.extractJobData();
    
    if (jobData) {
      console.log('✅ Job data extracted:', jobData);
      this.showSaveOverlay(jobData);
    } else {
      console.log('❌ No job data found on this page');
    }

    // Listen for URL changes (for SPAs like LinkedIn)
    this.observeURLChanges();
  }

  async extractJobData() {
    if (!this.extractor) {
      console.log('No extractor available for this site');
      return null;
    }

    try {
      const data = await this.extractor.extract();
      if (data) {
        // Add global database metadata
        data.extracted_data = {
          ...data.extracted_data,
          extraction_method: 'chrome_extension',
          site_detected: this.currentSite,
          page_title: document.title,
          extraction_timestamp: new Date().toISOString()
        };
      }
      return data;
    } catch (error) {
      console.error('Job extraction error:', error);
      return null;
    }
  }

  showSaveOverlay(jobData) {
    if (this.overlay) {
      this.overlay.remove();
    }

    this.overlay = new JobSaveOverlay(jobData, this.saveJobToGlobal.bind(this));
    this.overlay.show();
  }

  async saveJobToGlobal(jobData) {
    try {
      console.log('📤 Saving job to global database...');
      
      const result = await this.sendMessage({ 
        action: 'SAVE_JOB', 
        jobData: jobData 
      });
      
      if (result.success) {
        const message = result.data.created 
          ? 'Job saved to global database!' 
          : 'Job already exists in database!';
          
        this.showSuccessMessage(message);
        this.updateBadge();
        
        console.log('✅ Save result:', result.data);
      } else {
        this.showErrorMessage(result.error || 'Failed to save job');
      }
    } catch (error) {
      console.error('❌ Error saving job:', error);
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
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          ${type === 'success' 
            ? '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>'
            : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>'
          }
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  async updateBadge() {
    // Update badge with global job count
    await this.sendMessage({ action: 'UPDATE_BADGE', count: 1 });
  }

  observeURLChanges() {
    // Watch for URL changes (important for SPAs)
    let currentURL = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentURL) {
        currentURL = window.location.href;
        console.log('🔄 URL changed, re-initializing...');
        setTimeout(() => this.setup(), 2000); // Re-initialize after URL change with longer delay
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize when script loads
console.log('🎯 JobTracker Content Script Loaded');
new JobTrackerContent();
