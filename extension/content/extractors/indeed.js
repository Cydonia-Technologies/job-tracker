// =====================================================
// INDEED JOB EXTRACTOR - Complete Implementation
// =====================================================

// content/extractors/indeed.js
class IndeedExtractor {
  constructor() {
    this.source = 'indeed';
    this.selectors = {
      // Job title selectors (multiple fallbacks)
      title: [
        '[data-jk] h1 span[title]',
        '.jobsearch-JobInfoHeader-title span',
        'h1[data-testid="job-title"]',
        '.jobsearch-SerpJobCard h2 a span',
        'h1 span[title]'
      ],
      
      // Company name selectors
      company: [
        '[data-testid="inlineHeader-companyName"] a',
        '[data-testid="inlineHeader-companyName"]',
        '.jobsearch-InlineCompanyRating a',
        '.jobsearch-SerpJobCard .companyName',
        'span[data-testid="company-name"]'
      ],
      
      // Location selectors
      location: [
        '[data-testid="job-location"]',
        '.jobsearch-InlineCompanyRating + div',
        '.jobsearch-SerpJobCard .companyLocation',
        'div[data-testid="job-location"]'
      ],
      
      // Salary selectors
      salary: [
        '.jobsearch-JobMetadataHeader-item span',
        '.salary-snippet',
        '[data-testid="job-salary"]',
        '.jobsearch-SerpJobCard .salaryText'
      ],
      
      // Job description selectors
      description: [
        '#jobDescriptionText',
        '.jobsearch-jobDescriptionText',
        '[data-testid="job-description"]',
        '.jobsearch-SerpJobCard .summary'
      ],
      
      // Job type selectors
      jobType: [
        '.jobsearch-JobMetadataHeader-item:contains("time")',
        '.jobsearch-JobDescriptionSection-sectionItem:contains("time")',
        '.jobsearch-SerpJobCard .jobsearch-SerpJobCard-footer'
      ],
      
      // Posted date selectors
      postedDate: [
        '.jobsearch-JobMetadataFooter',
        '.jobsearch-SerpJobCard .date',
        'span:contains("days ago")',
        'span:contains("Posted")'
      ]
    };
  }

  async extract() {
    // Wait for page to load completely
    await this.waitForContent();
    
    // Determine page type
    const pageType = this.detectPageType();
    
    if (pageType === 'job-view') {
      return this.extractJobView();
    } else if (pageType === 'search-results') {
      return this.extractFromSearchResults();
    }
    
    return null;
  }

  detectPageType() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    if (url.includes('/viewjob') || pathname.includes('/viewjob')) {
      return 'job-view';
    } else if (url.includes('/jobs') || pathname.includes('/jobs')) {
      return 'search-results';
    }
    
    return 'unknown';
  }

  async waitForContent() {
    // Wait for Indeed's dynamic content to load
    return new Promise((resolve) => {
      const checkForContent = () => {
        const titleElement = this.findElement(this.selectors.title);
        const companyElement = this.findElement(this.selectors.company);
        
        if (titleElement && companyElement) {
          resolve();
        } else {
          setTimeout(checkForContent, 500);
        }
      };
      
      checkForContent();
    });
  }

  extractJobView() {
    const jobData = {
      title: this.extractText(this.selectors.title),
      company: this.extractText(this.selectors.company),
      location: this.extractText(this.selectors.location),
      salary_raw: this.extractText(this.selectors.salary),
      description: this.extractHTML(this.selectors.description),
      job_type: this.extractJobType(),
      posted_date: this.extractPostedDate(),
      url: this.cleanURL(window.location.href),
      source: this.source,
      extracted_data: {
        page_type: 'job-view',
        extracted_at: new Date().toISOString(),
        selectors_used: this.getUsedSelectors()
      }
    };

    // Parse salary information
    const salaryInfo = this.parseSalary(jobData.salary_raw);
    jobData.salary_min = salaryInfo.min;
    jobData.salary_max = salaryInfo.max;
    jobData.salary_currency = salaryInfo.currency;

    // Clean and validate data
    return this.validateAndCleanJobData(jobData);
  }

  extractFromSearchResults() {
    // For search results, find the currently highlighted job card
    const jobCards = document.querySelectorAll('[data-jk]');
    
    for (const card of jobCards) {
      if (this.isJobCardVisible(card)) {
        return this.extractFromJobCard(card);
      }
    }
    
    return null;
  }

  extractFromJobCard(cardElement) {
    const jobData = {
      title: this.extractTextFromCard(cardElement, this.selectors.title),
      company: this.extractTextFromCard(cardElement, this.selectors.company),
      location: this.extractTextFromCard(cardElement, this.selectors.location),
      salary_raw: this.extractTextFromCard(cardElement, this.selectors.salary),
      description: this.extractTextFromCard(cardElement, ['.summary']),
      url: this.extractJobURL(cardElement),
      source: this.source,
      extracted_data: {
        page_type: 'search-results',
        extracted_at: new Date().toISOString(),
        job_key: cardElement.getAttribute('data-jk')
      }
    };

    // Parse salary information
    const salaryInfo = this.parseSalary(jobData.salary_raw);
    jobData.salary_min = salaryInfo.min;
    jobData.salary_max = salaryInfo.max;
    jobData.salary_currency = salaryInfo.currency;

    return this.validateAndCleanJobData(jobData);
  }

  findElement(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  extractText(selectors) {
    const element = this.findElement(selectors);
    return element ? element.textContent.trim() : null;
  }

  extractHTML(selectors) {
    const element = this.findElement(selectors);
    return element ? element.innerHTML.trim() : null;
  }

  extractTextFromCard(cardElement, selectors) {
    for (const selector of selectors) {
      const element = cardElement.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    return null;
  }

  extractJobURL(cardElement) {
    const linkElement = cardElement.querySelector('h2 a, .jobTitle a');
    if (linkElement) {
      const href = linkElement.getAttribute('href');
      if (href.startsWith('/')) {
        return `https://www.indeed.com${href}`;
      }
      return href;
    }
    return window.location.href;
  }

  extractJobType() {
    // Look for job type indicators
    const fullText = document.body.textContent.toLowerCase();
    
    if (fullText.includes('full-time') || fullText.includes('full time')) {
      return 'full-time';
    } else if (fullText.includes('part-time') || fullText.includes('part time')) {
      return 'part-time';
    } else if (fullText.includes('contract') || fullText.includes('contractor')) {
      return 'contract';
    } else if (fullText.includes('internship') || fullText.includes('intern')) {
      return 'internship';
    }
    
    return null;
  }

  extractPostedDate() {
    const postedElement = this.findElement(this.selectors.postedDate);
    if (!postedElement) return null;
    
    const text = postedElement.textContent.toLowerCase();
    const today = new Date();
    
    if (text.includes('today')) {
      return today.toISOString().split('T')[0];
    } else if (text.includes('yesterday')) {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return yesterday.toISOString().split('T')[0];
    } else if (text.includes('days ago')) {
      const daysMatch = text.match(/(\d+)\s*days?\s*ago/);
      if (daysMatch) {
        const daysAgo = parseInt(daysMatch[1]);
        const date = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
      }
    }
    
    return null;
  }

  parseSalary(salaryText) {
    if (!salaryText) return { min: null, max: null, currency: 'USD' };
    
    // Remove common prefixes and clean text
    const cleaned = salaryText.replace(/^(Up to|From|Starting at)\s*/i, '').trim();
    
    // Extract numbers (handle various formats)
    const numbers = cleaned.match(/[\d,]+/g);
    if (!numbers) return { min: null, max: null, currency: 'USD' };
    
    // Parse numbers
    const parsedNumbers = numbers.map(n => parseInt(n.replace(/,/g, '')));
    
    // Determine if it's hourly, monthly, or yearly
    const isHourly = /hour|hr|\/h/i.test(cleaned);
    const isMonthly = /month|\/m/i.test(cleaned);
    
    let min = null, max = null;
    
    if (parsedNumbers.length === 1) {
      min = max = parsedNumbers[0];
    } else if (parsedNumbers.length >= 2) {
      min = Math.min(...parsedNumbers);
      max = Math.max(...parsedNumbers);
    }
    
    // Convert to annual salary if needed
    if (isHourly && min && max) {
      min = min * 40 * 52; // 40 hours/week, 52 weeks/year
      max = max * 40 * 52;
    } else if (isMonthly && min && max) {
      min = min * 12;
      max = max * 12;
    }
    
    return { min, max, currency: 'USD' };
  }

  cleanURL(url) {
    // Remove tracking parameters and clean up Indeed URLs
    const urlObj = new URL(url);
    const cleanParams = ['jk', 'from', 'rbc', 'rtk'];
    
    // Keep only essential parameters
    for (const param of urlObj.searchParams.keys()) {
      if (!cleanParams.includes(param)) {
        urlObj.searchParams.delete(param);
      }
    }
    
    return urlObj.toString();
  }

  isJobCardVisible(cardElement) {
    const rect = cardElement.getBoundingClientRect();
    return rect.top >= 0 && rect.top <= window.innerHeight;
  }

  validateAndCleanJobData(jobData) {
    // Ensure required fields are present
    if (!jobData.title || !jobData.company) {
      console.warn('Missing required job data:', jobData);
      return null;
    }
    
    // Clean up text fields
    jobData.title = this.cleanText(jobData.title);
    jobData.company = this.cleanText(jobData.company);
    jobData.location = this.cleanText(jobData.location);
    
    // Truncate description if too long
    if (jobData.description && jobData.description.length > 5000) {
      jobData.description = jobData.description.substring(0, 5000) + '...';
    }
    
    return jobData;
  }

  cleanText(text) {
    if (!text) return null;
    return text.replace(/\s+/g, ' ').trim();
  }

  getUsedSelectors() {
    // Return which selectors actually worked (for debugging)
    const used = {};
    for (const [key, selectors] of Object.entries(this.selectors)) {
      const workingSelector = selectors.find(s => document.querySelector(s));
      if (workingSelector) {
        used[key] = workingSelector;
      }
    }
    return used;
  }
}

// Make available globally
window.IndeedExtractor = IndeedExtractor;

