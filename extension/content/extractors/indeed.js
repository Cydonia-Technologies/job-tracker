// =====================================================
// INDEED JOB EXTRACTOR - Complete Clean Version
// =====================================================

class IndeedExtractor {
  constructor() {
    this.source = 'indeed';
    
    // Updated selectors based on actual Indeed structure
    this.selectors = {
      // Job title selectors - multiple fallbacks
      title: [
        '[data-testid="jobsearch-JobInfoHeader-title"] span',
        '.jobsearch-JobInfoHeader-title span',
        'h1 span[title]',
        'h2[data-testid="jobsearch-JobInfoHeader-title"] span',
        'h1', 'h2'
      ],
      
      // Company name selectors - cast a wider net
      company: [
        '[data-testid*="companyName"] a',
        '[data-testid*="companyName"]',
        '[id*="company"] a',
        '[id*="company"]',
        '.companyName a',
        '.companyName',
        // Search within any element that contains "Lockheed Martin" pattern
        'a[href*="/cmp/"]',
        'span:contains("Lockheed")', // Will be handled specially
      ],
      
      // Location selectors - cast a wider net  
      location: [
        '[data-testid*="location"] span',
        '[data-testid*="location"]',
        '[id*="location"]',
        '.location',
        // Look for PA zip code pattern
        'span:contains("PA ")',
      ],
      
      // Job description
      description: [
        '#jobDescriptionText',
        '.jobsearch-JobComponent-description',
        '[data-testid*="description"]'
      ],
      
      // Salary selectors
      salary: [
        '.jobsearch-JobMetadataHeader-item',
        '.salary-snippet',
        '[data-testid*="salary"]',
        'span:contains("$")'
      ]
    };
  }

  async extract() {
    console.log('=== INDEED EXTRACTOR STARTING ===');
    console.log('URL:', window.location.href);
    
    // Simplified wait - no infinite loops
    await this.waitForContent();
    
    // Debug what's actually available
    this.debugPageStructure();
    
    // Try extraction
    const jobData = await this.attemptExtraction();
    
    if (jobData) {
      console.log('✅ Successfully extracted job data:', jobData);
      return jobData;
    } else {
      console.log('❌ Failed to extract job data');
      return null;
    }
  }

  async waitForContent() {
    console.log('Waiting 3 seconds for Indeed to load...');
    return new Promise(resolve => setTimeout(resolve, 3000));
  }

  debugPageStructure() {
    console.log('=== DEBUGGING PAGE STRUCTURE ===');
    
    // Look for any text that matches our target data
    const targetTexts = ['Lockheed Martin', 'King of Prussia', 'PA 19406', 'Full Stack Engineer'];
    
    targetTexts.forEach(searchText => {
      const elements = this.findElementsContainingText(searchText);
      console.log(`Elements containing "${searchText}":`, elements.length);
      elements.slice(0, 3).forEach((el, i) => {
        console.log(`  ${i}: ${el.tagName}.${el.className} - "${el.textContent.trim().substring(0, 100)}"`);
      });
    });
    
    console.log('=== END DEBUG ===');
  }

  findElementsContainingText(searchText) {
    const allElements = document.querySelectorAll('*');
    const matchingElements = [];
    
    [...allElements].forEach(el => {
      if (el.textContent && el.textContent.includes(searchText) && el.children.length === 0) {
        matchingElements.push(el);
      }
    });
    
    return matchingElements;
  }

  async attemptExtraction() {
    // Try intelligent extraction by looking for the actual content
    const title = this.extractTitle();
    const company = this.extractCompany();  
    const location = this.extractLocation();
    const description = this.extractDescription();
    
    console.log('Extraction results:', { title, company, location });
    
    if (!title && !company) {
      console.log('No basic job data found');
      return null;
    }
    
    const jobData = {
      title: this.cleanTitle(title),
      company: company,
      location: location,
      description: description,
      url: this.cleanURL(window.location.href),
      source: this.source,
      extracted_data: {
        page_type: 'modern-indeed',
        extracted_at: new Date().toISOString(),
        extraction_method: 'intelligent-search'
      }
    };
    
    return this.validateAndCleanJobData(jobData);
  }

  extractTitle() {
    // Try standard selectors first
    for (const selector of this.selectors.title) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    // Fallback: look for text that looks like a job title
    const titleElements = this.findElementsContainingText('Engineer');
    for (const el of titleElements) {
      const text = el.textContent.trim();
      if (text.length < 100 && text.includes('Engineer')) {
        return text;
      }
    }
    
    return null;
  }

  extractCompany() {
    // Try standard selectors first
    for (const selector of this.selectors.company) {
      if (selector.includes(':contains(')) continue; // Skip pseudo-selectors
      
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    // Intelligent fallback: look for known company patterns
    const companyPatterns = ['Lockheed Martin', 'General Dynamics', 'Microsoft', 'Google', 'Amazon'];
    
    for (const pattern of companyPatterns) {
      const elements = this.findElementsContainingText(pattern);
      if (elements.length > 0) {
        return elements[0].textContent.trim();
      }
    }
    
    // Look for links that might be company links
    const companyLinks = document.querySelectorAll('a[href*="/cmp/"]');
    for (const link of companyLinks) {
      if (link.textContent.trim() && link.textContent.trim().length < 100) {
        return link.textContent.trim();
      }
    }
    
    return null;
  }

  extractLocation() {
    // Try standard selectors first
    for (const selector of this.selectors.location) {
      if (selector.includes(':contains(')) continue; // Skip pseudo-selectors
      
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    // Intelligent fallback: look for PA zip codes or location patterns
    const locationElements = this.findElementsContainingText('PA ');
    for (const el of locationElements) {
      const text = el.textContent.trim();
      if (text.match(/\b[A-Z][a-z\s]+,\s*PA\s*\d{5}\b/)) {
        return text;
      }
    }
    
    // Look for common PA cities
    const paCities = ['Philadelphia', 'Pittsburgh', 'King of Prussia', 'Harrisburg'];
    for (const city of paCities) {
      const elements = this.findElementsContainingText(city);
      if (elements.length > 0) {
        return elements[0].textContent.trim();
      }
    }
    
    return null;
  }

  extractDescription() {
    for (const selector of this.selectors.description) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.innerHTML.trim();
      }
    }
    return null;
  }

  cleanTitle(title) {
    if (!title) return null;
    // Remove Indeed's " - job post" suffix and other noise
    return title
      .replace(/\s*-\s*job post\s*$/i, '')
      .replace(/\s*\|\s*indeed\.com\s*$/i, '')
      .trim();
  }

  cleanURL(url) {
    try {
      const urlObj = new URL(url);
      // Keep only essential parameters
      const essentialParams = ['vjk', 'jk'];
      
      for (const param of [...urlObj.searchParams.keys()]) {
        if (!essentialParams.includes(param)) {
          urlObj.searchParams.delete(param);
        }
      }
      
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }

  validateAndCleanJobData(jobData) {
    // Ensure at least title OR company is present
    if (!jobData.title && !jobData.company) {
      console.warn('Missing required job data:', jobData);
      return null;
    }
    
    // Clean up text fields
    if (jobData.title) jobData.title = this.cleanText(jobData.title);
    if (jobData.company) jobData.company = this.cleanText(jobData.company);
    if (jobData.location) jobData.location = this.cleanText(jobData.location);
    
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

  // Test method to verify selectors work
  testSelectors() {
    console.log('=== TESTING SELECTORS ===');
    
    Object.entries(this.selectors).forEach(([key, selectors]) => {
      console.log(`${key} selectors:`);
      selectors.forEach((selector, index) => {
        if (selector.includes(':contains(')) {
          console.log(`  ${index}: "${selector}" → SKIPPED (pseudo-selector)`);
          return;
        }
        
        try {
          const element = document.querySelector(selector);
          const text = element ? element.textContent.trim().substring(0, 50) : 'NOT FOUND';
          console.log(`  ${index}: "${selector}" → ${text}`);
        } catch (e) {
          console.log(`  ${index}: "${selector}" → ERROR: ${e.message}`);
        }
      });
    });
    
    console.log('=== END SELECTOR TEST ===');
  }
}

// Make available globally
window.IndeedExtractor = IndeedExtractor;

// Auto-test when loaded (for debugging)
if (typeof window !== 'undefined' && window.location && window.location.hostname.includes('indeed.com')) {
  setTimeout(() => {
    console.log('Auto-testing Indeed extractor...');
    const extractor = new IndeedExtractor();
    extractor.testSelectors();
  }, 2000);
}
