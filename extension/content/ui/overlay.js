// =====================================================
// UPDATED JOB SAVE OVERLAY - Global Database UI
// =====================================================

class JobSaveOverlay {
  constructor(jobData, onSave) {
    this.jobData = jobData;
    this.onSave = onSave;
    this.overlay = null;
    this.isVisible = false;
  }

  show() {
    if (this.isVisible) return;
    
    this.createOverlay();
    this.attachEventListeners();
    this.animateIn();
    this.isVisible = true;
  }

  hide() {
    if (!this.isVisible) return;
    
    // Call onClose callback if provided
    if (this.onClose) {
      this.onClose();
    }
    
    this.animateOut(() => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      this.isVisible = false;
    });
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'job-tracker-overlay';
    this.overlay.innerHTML = `
      <div class="job-tracker-card">
        <div class="job-tracker-header">
          <div class="job-tracker-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" fill="currentColor"/>
              <path d="M8 11l2 2 4-4" stroke="white" stroke-width="2" fill="none"/>
            </svg>
            <span>JobTracker</span>
          </div>
          <button class="job-tracker-close" aria-label="Close">×</button>
        </div>
        
        <div class="job-tracker-content">
          <div class="job-info">
            <h3 class="job-title">${this.escapeHTML(this.jobData.title || 'Job Title')}</h3>
            <p class="job-company">${this.escapeHTML(this.jobData.company || 'Company')}</p>
            ${this.jobData.location ? `<p class="job-location">📍 ${this.escapeHTML(this.jobData.location)}</p>` : ''}
            ${this.jobData.salary_raw ? `<p class="job-salary">💰 ${this.escapeHTML(this.jobData.salary_raw)}</p>` : ''}
          </div>
          
          <div class="global-database-notice">
            <div style="background: linear-gradient(135deg, #e3f2fd, #f3e5f5); padding: 16px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 16px 0;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#2196f3">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <strong style="color: #1565c0;">Global Job Database</strong>
              </div>
              <p style="margin: 0; color: #424242; font-size: 14px; line-height: 1.4;">
                This job will be added to our shared database, helping all JobTracker users discover opportunities. No personal data is collected.
              </p>
            </div>
          </div>
          
          <div class="job-tracker-actions">
            <button class="job-tracker-btn job-tracker-btn-primary" id="save-job-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4z" stroke="currentColor" stroke-width="2" fill="none"/>
                <polyline points="9,9 9,13 15,13 15,9" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              Add to Database
            </button>
            <button class="job-tracker-btn job-tracker-btn-secondary" id="preview-btn">
              👁️ Preview Data
            </button>
          </div>
        </div>
        
        <div class="job-tracker-footer">
          <small style="color: #666;">
            Extracted from <strong>${this.jobData.source || 'job site'}</strong> • 
            <span id="job-count-text">Building global job database...</span>
          </small>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    
    // Fetch and display global job count
    this.updateJobCount();
  }

  async updateJobCount() {
    try {
      // Request global stats from background script
      const response = await this.sendMessageToBackground({
        action: 'GET_GLOBAL_JOBS',
        filters: { limit: 1 }
      });
      
      if (response.success && response.data.pagination) {
        const count = response.data.pagination.total;
        const jobCountText = document.getElementById('job-count-text');
        if (jobCountText) {
          jobCountText.innerHTML = `<strong>${count.toLocaleString()}</strong> jobs in database`;
        }
      }
    } catch (error) {
      console.log('Could not fetch job count:', error);
    }
  }

  async sendMessageToBackground(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || { success: false });
      });
    });
  }

  attachEventListeners() {
    // Close button
    this.overlay.querySelector('.job-tracker-close').addEventListener('click', () => {
      this.hide();
    });
    
    // Save job button
    this.overlay.querySelector('#save-job-btn').addEventListener('click', () => {
      this.handleSaveJob();
    });
    
    // Preview button
    this.overlay.querySelector('#preview-btn').addEventListener('click', () => {
      this.showPreview();
    });
    
    // Click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  async handleSaveJob() {
    const saveBtn = this.overlay.querySelector('#save-job-btn');
    const originalText = saveBtn.innerHTML;
    
    // Show loading state
    saveBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="spinning">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
      Saving to Database...
    `;
    saveBtn.disabled = true;
    
    try {
      await this.onSave(this.jobData);
      
      // Show success state
      saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
        </svg>
        Added Successfully!
      `;
      saveBtn.className = 'job-tracker-btn job-tracker-btn-success';
      
      // Update job count
      setTimeout(() => this.updateJobCount(), 500);
      
      // Auto-hide after success
      setTimeout(() => {
        this.hide();
      }, 2500);
      
    } catch (error) {
      console.error('Save error:', error);
      // Show error state
      saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
        </svg>
        Error - Try Again
      `;
      saveBtn.className = 'job-tracker-btn job-tracker-btn-error';
      saveBtn.disabled = false;
      
      // Reset after 3 seconds
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.className = 'job-tracker-btn job-tracker-btn-primary';
      }, 3000);
    }
  }

  showPreview() {
    const previewData = {
      ...this.jobData,
      note: 'This job will be saved to the global database (anonymously)',
      url_analysis: {
        url: this.jobData.url,
        url_type: this.jobData.extracted_data?.url_type || 'unknown',
        has_apply_link: this.jobData.extracted_data?.has_apply_link || false,
        page_url: this.jobData.extracted_data?.page_url || 'not available'
      }
    };
    
    const formattedData = JSON.stringify(previewData, null, 2);
    const previewWindow = window.open('', '_blank', 'width=700,height=800,scrollbars=yes');
    
    const urlStatusColor = previewData.url_analysis.has_apply_link ? '#4caf50' : '#ff9800';
    const urlStatusText = previewData.url_analysis.has_apply_link ? 'Direct Apply Link Found ✅' : 'Page URL Used ⚠️';
    
    previewWindow.document.write(`
      <html>
        <head>
          <title>Job Data Preview - JobTracker</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              margin: 20px; 
              background: #f5f5f5; 
            }
            .header {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            pre { 
              background: white; 
              padding: 20px; 
              border-radius: 8px;
              overflow: auto; 
              border: 1px solid #ddd;
              font-size: 12px;
              line-height: 1.4;
            }
            .notice {
              background: #e8f5e8;
              border: 1px solid #4caf50;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 20px;
              color: #2e7d32;
            }
            .url-status {
              background: white;
              border: 2px solid ${urlStatusColor};
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 20px;
              color: ${urlStatusColor};
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0;">📊 Extracted Job Data Preview</h2>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">JobTracker Chrome Extension</p>
          </div>
          <div class="url-status">
            🔗 <strong>URL Status:</strong> ${urlStatusText}
          </div>
          <div class="notice">
            <strong>🌍 Global Database Contribution</strong><br>
            This data will be added to our shared job database to help all users find opportunities. 
            No personal information is collected or stored.
          </div>
          <pre>${this.escapeHTML(formattedData)}</pre>
        </body>
      </html>
    `);
  }

  escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  animateIn() {
    this.overlay.style.opacity = '0';
    this.overlay.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      this.overlay.style.transition = 'all 0.3s ease';
      this.overlay.style.opacity = '1';
      this.overlay.style.transform = 'translateY(0)';
    });
  }

  animateOut(callback) {
    this.overlay.style.transition = 'all 0.3s ease';
    this.overlay.style.opacity = '0';
    this.overlay.style.transform = 'translateY(-20px)';
    
    setTimeout(callback, 300);
  }
}

// Make available globally
window.JobSaveOverlay = JobSaveOverlay;
