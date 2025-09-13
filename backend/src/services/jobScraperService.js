// =====================================================
// ENHANCED JOB SCRAPER WITH ADVANCED CLOUDFLARE BYPASS
// =====================================================

const puppeteer = require('puppeteer');
const { supabase, supabaseAdmin } = require('../config/database');

class JobScraperService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.source = 'indeed';
    
    // Reduced queries to minimize detection
    this.searchQueries = [
      'entry level software engineer',
      'junior developer'
    ];

    // User agents for rotation
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
    ];
  }

  // Enhanced browser initialization with maximum stealth
  async initialize() {
    console.log('🚀 Starting Enhanced Job Scraper with advanced anti-detection...');
    
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    console.log(`🎭 Using User-Agent: ${randomUserAgent.split(' ')[0]}...`);
    
    this.browser = await puppeteer.launch({
      headless: false, // Keep visible for manual intervention if needed
      defaultViewport: null,
      ignoreDefaultArgs: ['--enable-automation'],
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
        '--disable-ipc-flooding-protection',
        '--start-maximized',
        '--window-size=1920,1080',
        '--disable-default-apps',
        '--disable-sync',
        '--no-default-browser-check',
        '--disable-client-side-phishing-detection',
        '--disable-hang-monitor',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-background-networking',
        '--disable-background-sync',
        '--disable-component-extensions-with-background-pages',
        '--disable-permissions-api',
        `--user-agent=${randomUserAgent}`
      ]
    });

    this.page = await this.browser.newPage();
    
    // Enhanced stealth configuration
    await this.page.evaluateOnNewDocument(() => {
      // Remove webdriver property completely
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override webdriver property in multiple ways
      delete navigator.webdriver;
      
      // Mock chrome runtime more realistically
      window.chrome = {
        runtime: {
          onConnect: undefined,
          onMessage: undefined,
        },
        loadTimes: function() {
          return {
            connectionInfo: 'http/1.1',
            finishDocumentLoadTime: 1508577098.6559999,
            finishLoadTime: 1508577098.656,
            firstPaintAfterLoadTime: 0,
            firstPaintTime: 1508577098.6559999,
            navigationType: 'Other',
            npnNegotiatedProtocol: 'unknown',
            requestTime: 1508577097.03,
            startLoadTime: 1508577097.034,
            wasAlternateProtocolAvailable: false,
            wasFetchedViaSpdy: false,
            wasNpnNegotiated: false
          };
        }
      };

      // Mock plugins more realistically
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: Plugin},
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            length: 1,
            name: "Chrome PDF Plugin"
          },
          {
            0: {type: "application/pdf", suffixes: "pdf", description: "", enabledPlugin: Plugin},
            description: "",
            filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
            length: 1,
            name: "Chrome PDF Viewer"
          },
          {
            0: {type: "application/x-nacl", suffixes: "", description: "Native Client Executable", enabledPlugin: Plugin},
            1: {type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable", enabledPlugin: Plugin},
            description: "",
            filename: "internal-nacl-plugin",
            length: 2,
            name: "Native Client"
          }
        ],
      });

      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Mock deviceMemory
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8,
      });

      // Mock hardwareConcurrency
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 4,
      });

      // Override the permissions API
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: 'granted' }) :
          originalQuery(parameters)
      );

      // Mock connection
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          downlink: 10,
          effectiveType: '4g',
          rtt: 50
        }),
      });
    });

    // Set realistic headers with the selected user agent
    await this.page.setUserAgent(randomUserAgent);
    
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'DNT': '1'
    });

    // Set realistic viewport
    await this.page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false,
    });

    console.log('✅ Enhanced browser initialized with maximum stealth');
  }

  // Enhanced main scraping with longer warm-up period
  async scrapeJobs(maxJobs = 30) {
    if (!this.browser) {
      await this.initialize();
    }

    console.log('🌐 Extended browser warm-up sequence...');
    
    // Multi-step warm-up to appear more human
    try {
      // Step 1: Visit Google and interact
      console.log('🔍 Step 1: Visiting Google...');
      await this.page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
      await this.enhancedHumanSimulation();
      
      // Step 2: Search something on Google
      console.log('🔍 Step 2: Performing Google search...');
      await this.page.type('input[name="q"]', 'indeed jobs', { delay: 150 });
      await this.delay(1000);
      await this.page.keyboard.press('Enter');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      await this.enhancedHumanSimulation();
      
      // Step 3: Visit a few random pages
      console.log('🔍 Step 3: Browsing random sites...');
      const warmupSites = ['https://www.stackoverflow.com', 'https://www.github.com'];
      for (const site of warmupSites) {
        try {
          await this.page.goto(site, { waitUntil: 'networkidle2', timeout: 20000 });
          await this.enhancedHumanSimulation();
        } catch (error) {
          console.log(`⚠️ Skipping ${site}: ${error.message}`);
        }
      }
      
      console.log('✅ Extended warm-up completed');
    } catch (error) {
      console.error('❌ Warm-up failed:', error.message);
    }

    // Now try Indeed with enhanced approach
    console.log('🔍 Accessing Indeed with enhanced stealth...');
    let indeedAttempts = 0;
    const maxAttempts = 3;
    
    while (indeedAttempts < maxAttempts) {
      try {
        console.log(`🔄 Indeed attempt ${indeedAttempts + 1}/${maxAttempts}`);
        
        await this.page.goto('https://www.indeed.com', { 
          waitUntil: 'networkidle0', 
          timeout: 45000 
        });
        
        await this.delay(3000);
        
        // Enhanced Cloudflare detection and handling
        const title = await this.page.title();
        const content = await this.page.content();
        
        console.log(`📄 Page title: "${title}"`);
        
        if (title.includes('Just a moment') || 
            title.includes('Attention Required') ||
            content.includes('Checking your browser') || 
            content.includes('cloudflare') ||
            content.includes('ray id') ||
            content.includes('Please wait while we check your browser')) {
          
          console.log('🛡️  Cloudflare challenge detected!');
          console.log('📸 Taking screenshot for analysis...');
          await this.page.screenshot({ path: `cloudflare-challenge-${Date.now()}.png` });
          
          console.log('⏳ Extended wait for Cloudflare (up to 30 seconds)...');
          
          // Enhanced waiting strategy
          for (let i = 0; i < 30; i++) {
            await this.delay(1000);
            
            const currentTitle = await this.page.title();
            const currentContent = await this.page.content();
            
            if (!currentTitle.includes('Just a moment') && 
                !currentTitle.includes('Attention Required') &&
                !currentContent.includes('Checking your browser') &&
                !currentContent.includes('Please wait while we check')) {
              console.log(`✅ Cloudflare challenge cleared after ${i + 1} seconds`);
              break;
            }
            
            if (i % 5 === 0) {
              console.log(`⏳ Still waiting... ${i + 1}/30 seconds`);
              // Simulate very light mouse movement
              await this.page.mouse.move(
                Math.random() * 100 + 500,
                Math.random() * 100 + 300
              );
            }
          }
          
          // Final check
          const finalTitle = await this.page.title();
          if (finalTitle.includes('Just a moment') || finalTitle.includes('Attention Required')) {
            throw new Error('Cloudflare challenge not resolved');
          }
        }
        
        console.log('✅ Successfully accessed Indeed');
        break;
        
      } catch (error) {
        indeedAttempts++;
        console.error(`❌ Indeed attempt ${indeedAttempts} failed: ${error.message}`);
        
        if (indeedAttempts < maxAttempts) {
          const retryDelay = 15000 + (indeedAttempts * 10000); // Increasing delays
          console.log(`⏱️  Waiting ${retryDelay/1000}s before retry...`);
          await this.delay(retryDelay);
        } else {
          console.error('❌ All Indeed attempts failed');
          return [];
        }
      }
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
        
        // Very long delay between searches to avoid rate limiting
        const delay = 15000 + Math.random() * 15000; // 15-30 seconds
        console.log(`⏱️  Extended wait ${Math.round(delay/1000)}s before next search...`);
        await this.delay(delay);
        
        // Enhanced human behavior simulation
        await this.enhancedHumanSimulation();
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

  // Enhanced human simulation with more realistic patterns
  async enhancedHumanSimulation() {
    try {
      console.log('🤖 Simulating human behavior...');
      
      // Random wait period
      await this.delay(1000 + Math.random() * 3000);
      
      // Realistic scrolling pattern
      const scrollSteps = 3 + Math.floor(Math.random() * 5);
      for (let i = 0; i < scrollSteps; i++) {
        await this.page.evaluate((step) => {
          const scrollHeight = document.body.scrollHeight;
          const scrollPosition = (scrollHeight / scrollSteps) * step + Math.random() * 200;
          window.scrollTo(0, scrollPosition);
        }, i);
        await this.delay(800 + Math.random() * 1200);
      }
      
      // Random mouse movements across the page
      for (let i = 0; i < 3; i++) {
        await this.page.mouse.move(
          Math.random() * 1200 + 200,
          Math.random() * 800 + 200,
          { steps: 10 + Math.floor(Math.random() * 20) }
        );
        await this.delay(300 + Math.random() * 700);
      }
      
      // Occasionally hover over links
      const links = await this.page.$$('a').catch(() => []);
      if (links.length > 0) {
        const randomLink = links[Math.floor(Math.random() * Math.min(links.length, 10))];
        await randomLink.hover().catch(() => {});
        await this.delay(500 + Math.random() * 1500);
      }
      
      // Simulate reading behavior
      await this.delay(2000 + Math.random() * 4000);
      
      console.log('✅ Human simulation completed');
    } catch (error) {
      console.log('⚠️ Human simulation error (non-critical):', error.message);
    }
  }

  // Enhanced search results scraping with better error handling
  async scrapeSearchResultsPage(query) {
    console.log(`🔍 Enhanced search for: "${query}"`);
    
    try {
      // Navigate to search page with enhanced parameters
      const searchURL = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&fromage=14&sort=date&radius=50`;
      console.log(`📄 Loading: ${searchURL}`);
      
      await this.page.goto(searchURL, { waitUntil: 'networkidle0', timeout: 45000 });
      await this.delay(4000 + Math.random() * 3000);
      
      // Check for any blocking pages
      const pageTitle = await this.page.title();
      const pageContent = await this.page.content();
      
      if (pageTitle.includes('verification') || 
          pageTitle.includes('challenge') || 
          pageTitle.includes('blocked') ||
          pageContent.includes('verify you are human') || 
          pageContent.includes('security check') ||
          pageContent.includes('unusual traffic')) {
        
        console.log('🚫 Blocking page detected!');
        console.log('📸 Taking screenshot...');
        await this.page.screenshot({ path: `blocking-page-${Date.now()}.png` });
        throw new Error('Access blocked - scraping detected');
      }
      
      // Enhanced waiting for job cards
      console.log('⏳ Waiting for job listings to load...');
      try {
        await this.page.waitForSelector('[data-jk], .jobsearch-SerpJobCard, .job_seen_beacon', { timeout: 20000 });
      } catch (error) {
        console.log('⚠️ Primary selectors not found, trying alternatives...');
        await this.page.waitForSelector('.slider_container, .jobsearch-results', { timeout: 15000 });
      }
      
      await this.delay(3000);
      await this.enhancedHumanSimulation();

      console.log(`📋 Extracting jobs from search results...`);

      // Enhanced job extraction with multiple selector strategies
      const jobs = await this.page.evaluate(() => {
        const extractedJobs = [];
        
        // Try multiple selector strategies for job cards
        let jobCards = document.querySelectorAll('[data-jk]');
        if (jobCards.length === 0) {
          jobCards = document.querySelectorAll('.jobsearch-SerpJobCard');
        }
        if (jobCards.length === 0) {
          jobCards = document.querySelectorAll('.job_seen_beacon');
        }
        
        console.log(`Found ${jobCards.length} job cards using fallback selectors`);
        
        jobCards.forEach((card, index) => {
          try {
            // Enhanced title and URL extraction
            let title = null;
            let jobUrl = null;
            
            // Try multiple strategies for title extraction
            const titleLinkSelectors = [
              'h2 a[data-jk]',
              'h2 a',
              '.jobTitle a',
              '[data-testid="job-title"] a'
            ];
            
            let titleLink = null;
            for (const selector of titleLinkSelectors) {
              titleLink = card.querySelector(selector);
              if (titleLink) break;
            }
            
            if (titleLink) {
              // Extract title from various possible elements
              const titleSelectors = ['span[title]', 'span', '[data-testid="job-title"]'];
              for (const selector of titleSelectors) {
                const titleEl = titleLink.querySelector(selector);
                if (titleEl && titleEl.textContent.trim()) {
                  title = titleEl.textContent.trim();
                  break;
                }
              }
              
              // If no title in span, use link text
              if (!title && titleLink.textContent.trim()) {
                title = titleLink.textContent.trim();
              }
              
              // Extract URL
              const href = titleLink.getAttribute('href');
              if (href) {
                jobUrl = href.startsWith('http') ? href : `https://www.indeed.com${href}`;
              }
            }
            
            // Enhanced company extraction with more selectors
            let company = null;
            const companySelectors = [
              '[data-testid="company-name"]',
              'span[data-testid="company-name"]',
              '.companyName a',
              '.companyName span',
              '.companyName',
              '[data-testid="company-name"] a',
              '.company'
            ];
            
            for (const selector of companySelectors) {
              const companyEl = card.querySelector(selector);
              if (companyEl && companyEl.textContent.trim()) {
                company = companyEl.textContent.trim();
                break;
              }
            }
            
            // Enhanced location extraction with better cleaning
            let location = null;
            const locationSelectors = [
              '[data-testid="job-location"]',
              '[data-testid="text-location"]',
              'div[data-testid="text-location"]',
              '.companyLocation',
              '[data-testid="location"]',
              '.location'
            ];
            
            for (const selector of locationSelectors) {
              const locationEl = card.querySelector(selector);
              if (locationEl && locationEl.textContent.trim()) {
                location = locationEl.textContent
                  .replace(/<!--.*?-->/g, '') // Remove HTML comments
                  .replace(/\s+/g, ' ') // Normalize spaces
                  .replace(/^\s*•\s*/, '') // Remove bullet points
                  .trim();
                if (location && location.length > 1) break;
              }
            }
            
            // Enhanced salary extraction
            let salary = null;
            const salarySelectors = [
              '.mosaic-provider-jobcards-4n9q2y',
              '.salary-snippet-container',
              '.salary-snippet',
              '[data-testid="salary-snippet"]',
              '.salaryOnly',
              '.estimated-salary'
            ];
            
            for (const selector of salarySelectors) {
              const salaryEl = card.querySelector(selector);
              if (salaryEl && salaryEl.textContent.includes('$')) {
                salary = salaryEl.textContent.trim();
                break;
              }
            }
            
            // Enhanced description extraction
            let description = null;
            const descSelectors = [
              '.summary',
              '.job-snippet',
              '[data-testid="job-snippet"]',
              '.jobsearch-jobDescriptionText'
            ];
            
            for (const selector of descSelectors) {
              const descEl = card.querySelector(selector);
              if (descEl && descEl.textContent.trim()) {
                description = descEl.textContent.trim();
                break;
              }
            }
            
            // Enhanced validation - require title and company
            if (title && company && 
                title.length > 3 && company.length > 1 &&
                !title.toLowerCase().includes('not found') &&
                !company.toLowerCase().includes('not found')) {
              
              const jobData = {
                title: title,
                company: company,
                location: location || null,
                description: description || null,
                url: jobUrl || `${window.location.href}#job-${index}`,
                source: 'indeed',
                extracted_data: {
                  page_type: 'indeed-search-results-enhanced',
                  extracted_at: new Date().toISOString(),
                  extraction_method: 'enhanced-multi-selector',
                  raw_salary: salary,
                  card_index: index,
                  original_href: titleLink ? titleLink.getAttribute('href') : null,
                  selector_used: 'enhanced-fallback'
                }
              };
              
              extractedJobs.push(jobData);
              console.log(`✅ Enhanced Job ${index + 1}: ${title} at ${company} (${location || 'No location'})`);
            } else {
              console.log(`⚠️ Skipping job ${index + 1}: Insufficient data (Title: "${title}", Company: "${company}")`);
            }
          } catch (error) {
            console.error(`Error in enhanced extraction for job ${index}:`, error.message);
          }
        });
        
        return extractedJobs;
      });

      console.log(`📊 Enhanced extraction: ${jobs.length} valid jobs from search results`);
      return jobs;
      
    } catch (error) {
      console.error(`❌ Enhanced search error: ${error.message}`);
      return [];
    }
  }

  // Enhanced database saving with better duplicate detection
  async saveJobsToDatabase(jobs) {
    console.log(`\n💾 Saving ${jobs.length} jobs to database with enhanced validation...`);
    
    const jobsToInsert = jobs
      .filter(job => job && job.title && job.company && job.title.length > 3 && job.company.length > 1)
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
        // Enhanced duplicate detection
        const { data: existingJob } = await supabase
          .from('jobs')
          .select('id')
          .or(`url.eq.${job.url},and(title.ilike.%${job.title}%,company.ilike.%${job.company}%)`)
          .single();

        if (existingJob) {
          console.log(`⏭️  Similar job exists, skipping: ${job.title} at ${job.company}`);
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
          console.log(`✅ Saved: ${job.title} at ${job.company} (${job.location || 'No location'})`);
        }
      } catch (error) {
        console.error(`❌ Error processing job "${job.title}":`, error.message);
        errors.push({ job: job.title, error: error.message });
      }
    }

    console.log(`\n📊 ENHANCED SAVE SUMMARY:`);
    console.log(`✅ Successfully saved: ${savedJobs} jobs`);
    console.log(`⚠️  Errors/Duplicates: ${errors.length}`);
    
    return savedJobs;
  }

  // Keep all existing helper methods unchanged
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
