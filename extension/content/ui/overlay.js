
// =====================================================
// JOB SAVE OVERLAY UI - Interactive Save Button
// =====================================================

// content/ui/overlay.js
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
              <path d="M20 6h-2V4c0-1.11-.89-2-2-2H8c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11h20V8c0-1.11-.89-2-2-2zM8 4h8v2H8V4z" fill="currentColor"/>
            </svg>
            <span>Job Tracker</span>
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
          
          <div class="job-tracker-actions">
            <button class="job-tracker-btn job-tracker-btn-primary" id="save-job-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
              Save Job
            </button>
            <button class="job-tracker-btn job-tracker-btn-secondary" id="preview-btn">
              👁️ Preview
            </button>
          </div>
        </div>
        
        <div class="job-tracker-footer">
          <small>Extracted from ${this.jobData.source || 'job site'}</small>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
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
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none"/>
      </svg>
      Saving...
    `;
    saveBtn.disabled = true;
    
    try {
      await this.onSave(this.jobData);
      
      // Show success state
      saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
        </svg>
        Saved!
      `;
      saveBtn.className = 'job-tracker-btn job-tracker-btn-success';
      
      // Auto-hide after success
      setTimeout(() => {
        this.hide();
      }, 1500);
      
    } catch (error) {
      // Show error state
      saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
        Try Again
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
    const previewData = JSON.stringify(this.jobData, null, 2);
    const previewWindow = window.open('', '_blank', 'width=600,height=800');
    previewWindow.document.write(`
      <html>
        <head><title>Job Data Preview</title></head>
        <body>
          <h2>Extracted Job Data</h2>
          <pre style="background: #f5f5f5; padding: 20px; overflow: auto;">${this.escapeHTML(previewData)}</pre>
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
