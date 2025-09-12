// =====================================================
// JOB SCRAPER WITH CLOUDFLARE BYPASS
// =====================================================

const puppeteer = require('puppeteer');
const { supabase, supabaseAdmin } = require('../config/database');

class JobScraperService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.source = 'indeed';
    
    // Start with fewer searches to avoid detection
    this.searchQueries = [
      'entry level software engineer',
      'junior developer',
      'software intern 2025'
    ];
  }

  // Initialize browser with maximum stealth
  async initialize() {
    console.log('🚀 Starting Job Scraper with anti-detection...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Keep visible for debugging
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        '--no-first-run',
        '--disable-extensions-except',
        '--disable-plugins-discovery',
        '--disable-dev-shm-usage',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--start-maximized'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Advanced stealth configuration
    await this.page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Mock chrome runtime
      window.chrome = {
        runtime: {},
      };

      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Meteor.isProduction ? 'granted' : 'default' }) :
          originalQuery(parameters)
      );
    });

    // Set realistic headers
    await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    });

    console.log('✅ Browser initialized with stealth mode');
  }

  // Main scraping with human simulation
  async scrapeJobs(maxJobs = 50) {
    if (!this.browser) {
      await this.initialize();
    }

    console.log('🌐 Warming up browser...');
    
    // First visit Google to warm up the browser
    try {
      await this.page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
      await this.simulateHumanBrowsing();
      console.log('✅ Browser warmed up');
    } catch (error) {
      console.error('❌ Failed to warm up browser:', error.message);
    }

    // Now try Indeed
    console.log('🔍 Accessing Indeed...');
    try {
      await this.page.goto('https://www.indeed.com', { waitUntil: 'networkidle2', timeout: 30000 });
      await this.simulateHumanBrowsing();
      
      // Check for Cloudflare challenge
      const title = await this.page.title();
      const content = await this.page.content();
      
      if (title.includes('Just a moment') || content.includes('Checking your browser') || content.includes('cloudflare')) {
        console.log('🛡️  Cloudflare challenge detected!');
        console.log('⏳ Waiting for challenge to complete...');
        
        // Wait up to 15 seconds for Cloudflare to complete
        await this.page.waitForFunction(
          () => !document.title.includes('Just a moment') && !document.body.innerText.includes('Checking your browser'),
          { timeout: 15000 }
        ).catch(() => {
          console.log('⚠️  Cloudflare challenge may still be active');
        });
        
        await this.delay(2000);
      }
      
      console.log('✅ Successfully accessed Indeed');
    } catch (error) {
      console.error('❌ Failed to access Indeed:', error.message);
      return [];
    }

    const allJobs = [];
    let jobsCollected = 0;

    for (const query of this.searchQueries) {
      if (jobsCollected >= maxJobs) break;

      console.log(`\n🔍 Searching: "${query}"`);
      
      try {
        const jobsFromQuery = await this.scrapeSearchResultsPage(query);
        
        // Process salary for each job
        jobsFromQuery.forEach(job => {
          if (job && job.extracted_data?.raw_salary) {
            job.salary_min = this.parseSalaryMin(job.extracted_data.raw_salary);
            job.salary_max = this.parseSalaryMax(job.extracted_data.raw_salary);
          }
        });
        
        allJobs.push(...jobsFromQuery);
        jobsCollected = allJobs.length;
        
        console.log(`✅ Found ${jobsFromQuery.length} jobs on search results page`);
        
        // Long delay between searches
        const delay = 8000 + Math.random() * 7000; // 8-15 seconds
        console.log(`⏱️  Waiting ${Math.round(delay/1000)}s before next search...`);
        await this.delay(delay);
        
        // Simulate human behavior between searches
        await this.simulateHumanBrowsing();
      } catch (error) {
        console.error(`❌ Error with query "${query}":`, error.message);
      }
    }

    console.log(`\n🎉 Total jobs collected: ${allJobs.length}`);
    
    // Save to database
    if (allJobs.length > 0) {
      await this.saveJobsToDatabase(allJobs);
    }

    return allJobs;
  }

  // Simulate human browsing behavior
  async simulateHumanBrowsing() {
    try {
      // Random mouse movements
      await this.page.mouse.move(
        Math.random() * 800 + 200,
        Math.random() * 600 + 200
      );
      await this.delay(500 + Math.random() * 1000);
      
      // Random scroll
      await this.page.evaluate(() => {
        window.scrollTo(0, Math.random() * 300);
      });
      await this.delay(1000 + Math.random() * 2000);
      
      // Maybe hover over a random element
      const elements = await this.page.$$('a, button, div').catch(() => []);
      if (elements.length > 0) {
        const randomElement = elements[Math.floor(Math.random() * Math.min(elements.length, 5))];
        await randomElement.hover().catch(() => {});
        await this.delay(500 + Math.random() * 1500);
      }
    } catch (error) {
      // Ignore errors in simulation
    }
  }

  // Scrape search results page with careful navigation
  async scrapeSearchResultsPage(query) {
    console.log(`🔍 Searching for: "${query}"`);
    
    try {
      // Navigate to search page
      const searchURL = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&fromage=14&sort=date`;
      console.log(`📄 Loading: ${searchURL}`);
      
      await this.page.goto(searchURL, { waitUntil: 'networkidle0', timeout: 30000 });
      await this.delay(3000 + Math.random() * 2000);
      
      // Check for verification/challenge pages
      const pageTitle = await this.page.title();
      const pageContent = await this.page.content();
      
      if (pageTitle.includes('verification') || pageTitle.includes('challenge') || 
          pageContent.includes('verify you are human') || pageContent.includes('security check')) {
        console.log('🤖 Verification page detected!');
        console.log('📸 Taking screenshot for debugging...');
        await this.page.screenshot({ path: 'verification-detected.png' });
        throw new Error('Verification page detected - scraping blocked');
      }
      
      // Wait for job cards
      await this.page.waitForSelector('[data-jk], .jobsearch-SerpJobCard', { timeout: 15000 });
      await this.delay(2000);

      console.log(`📋 Extracting jobs from search results...`);

      // Extract job data
      const jobs = await this.page.evaluate(() => {
        const extractedJobs = [];
        const jobCards = document.querySelectorAll('[data-jk]');
        console.log(`Found ${jobCards.length} job cards`);
        
        jobCards.forEach((card, index) => {
          try {
            // Extract title
            let title = null;
            const titleSelectors = ['h2 a span[title]', 'h2 a span', '.jobTitle a span'];
            for (const selector of titleSelectors) {
              const titleEl = card.querySelector(selector);
              if (titleEl && titleEl.textContent.trim()) {
                title = titleEl.textContent.trim();
                break;
              }
            }
            
            // Extract company
            let company = null;
            const companySelectors = ['.companyName a', '.companyName span', '.companyName'];
            for (const selector of companySelectors) {
              const companyEl = card.querySelector(selector);
              if (companyEl && companyEl.textContent.trim()) {
                company = companyEl.textContent.trim();
                break;
              }
            }
            
            // Extract location
            let location = null;
            const locationSelectors = ['[data-testid="job-location"]', '.companyLocation'];
            for (const selector of locationSelectors) {
              const locationEl = card.querySelector(selector);
              if (locationEl && locationEl.textContent.trim()) {
                location = locationEl.textContent.trim();
                break;
              }
            }
            
            // Extract salary
            let salary = null;
            const salarySelectors = ['.salary-snippet-container', '.salary-snippet'];
            for (const selector of salarySelectors) {
              const salaryEl = card.querySelector(selector);
              if (salaryEl && salaryEl.textContent.includes('$')) {
                salary = salaryEl.textContent.trim();
                break;
              }
            }
            
            // Extract description
            let description = null;
            const descSelectors = ['.summary', '.job-snippet'];
            for (const selector of descSelectors) {
              const descEl = card.querySelector(selector);
              if (descEl && descEl.textContent.trim()) {
                description = descEl.textContent.trim();
                break;
              }
            }
            
            // Only save if we have title OR company
            if (title || company) {
              const jobData = {
                title: title || 'Title not found',
                company: company || 'Company not found',
                location: location,
                description: description,
                url: window.location.href + `#job-${index}`,
                source: 'indeed',
                extracted_data: {
                  page_type: 'indeed-search-results',
                  extracted_at: new Date().toISOString(),
                  extraction_method: 'search-results-only',
                  raw_salary: salary,
                  card_index: index
                }
              };
              
              extractedJobs.push(jobData);
              console.log(`✅ Job ${index + 1}: ${title} at ${company}`);
            }
          } catch (error) {
            console.error(`Error extracting job ${index}:`, error.message);
          }
        });
        
        return extractedJobs;
      });

      console.log(`📊 Extracted ${jobs.length} jobs from search results`);
      return jobs;
      
    } catch (error) {
      console.error(`❌ Error scraping search results: ${error.message}`);
      return [];
    }
  }

  // Save jobs to database with null user_id
  async saveJobsToDatabase(jobs) {
    console.log(`\n💾 Saving ${jobs.length} jobs to database...`);
    
    const jobsToInsert = jobs
      .filter(job => job && job.title)
      .map(job => ({
        ...job,
        user_id: null, // NULL for seed/public jobs
        posted_date: new Date().toISOString().split('T')[0],
        job_type: this.detectJobType(job.title),
        experience_level: this.detectExperienceLevel(job.title, job.description),
        is_remote: this.detectRemote(job.title, job.description, job.location),
        tags: this.extractTags(job.title, job.description)
      }));

    let savedJobs = 0;
    const errors = [];

    for (const job of jobsToInsert) {
      try {
        // Check if job already exists
        const { data: existingJob } = await supabase
          .from('jobs')
          .select('id')
          .eq('url', job.url)
          .single();

        if (existingJob) {
          console.log(`⏭️  Job already exists, skipping: ${job.title}`);
          continue;
        }

        // Insert new job using admin client
        const { data, error } = await supabaseAdmin
          .from('jobs')
          .insert(job)
          .select();

        if (error) {
          console.error(`❌ Error saving job "${job.title}":`, error.message);
          errors.push({ job: job.title, error: error.message });
        } else {
          savedJobs++;
          console.log(`✅ Saved: ${job.title} at ${job.company}`);
        }
      } catch (error) {
        console.error(`❌ Error processing job "${job.title}":`, error.message);
        errors.push({ job: job.title, error: error.message });
      }
    }

    console.log(`\n📊 SAVE SUMMARY:`);
    console.log(`✅ Successfully saved: ${savedJobs} jobs`);
    console.log(`⚠️  Errors/Duplicates: ${errors.length}`);
    
    return savedJobs;
  }

  // Helper methods
  parseSalaryMin(salaryText) {
    if (!salaryText) return null;
    const patterns = [/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, /(\d+)k/gi];
    const numbers = [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(salaryText)) !== null) {
        let num = parseInt(match[1].replace(/,/g, ''));
        if (pattern.source.includes('k')) num *= 1000;
        numbers.push(num);
      }
    }
    
    return numbers.length > 0 ? Math.min(...numbers) : null;
  }

  parseSalaryMax(salaryText) {
    if (!salaryText) return null;
    const patterns = [/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, /(\d+)k/gi];
    const numbers = [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(salaryText)) !== null) {
        let num = parseInt(match[1].replace(/,/g, ''));
        if (pattern.source.includes('k')) num *= 1000;
        numbers.push(num);
      }
    }
    
    return numbers.length > 0 ? Math.max(...numbers) : null;
  }

  detectJobType(title) {
    if (!title) return 'full-time';
    const titleLower = title.toLowerCase();
    if (titleLower.includes('intern')) return 'internship';
    if (titleLower.includes('contract')) return 'contract';
    if (titleLower.includes('part-time')) return 'part-time';
    return 'full-time';
  }

  detectExperienceLevel(title, description) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    if (text.includes('intern')) return 'internship';
    if (text.includes('entry level') || text.includes('junior')) return 'entry-level';
    if (text.includes('senior')) return 'senior';
    return 'entry-level';
  }

  detectRemote(title, description, location) {
    const text = `${title || ''} ${description || ''} ${location || ''}`.toLowerCase();
    return text.includes('remote') || text.includes('work from home');
  }

  extractTags(title, description) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    const tags = [];
    const techKeywords = ['javascript', 'react', 'python', 'java', 'sql', 'aws'];
    
    techKeywords.forEach(keyword => {
      if (text.includes(keyword)) tags.push(keyword);
    });
    
    return tags.slice(0, 10);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { JobScraperService };
