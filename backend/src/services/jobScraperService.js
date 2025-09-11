// =====================================================
// JOB SCRAPER SERVICE - Indeed to Database (FIXED)
// =====================================================

const puppeteer = require('puppeteer');
const { supabase } = require('../config/database');

class JobScraperService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.source = 'indeed';
    
    // Ported from your extension - these selectors work well
    this.selectors = {
      // Job title selectors - multiple fallbacks
      title: [
        '[data-testid="jobsearch-JobInfoHeader-title"] span',
        '.jobsearch-JobInfoHeader-title span',
        'h1 span[title]',
        'h2[data-testid="jobsearch-JobInfoHeader-title"] span',
        'h1', 'h2'
      ],
      
      // Company name selectors
      company: [
        '[data-testid*="companyName"] a',
        '[data-testid*="companyName"]',
        '[id*="company"] a',
        '[id*="company"]',
        '.companyName a',
        '.companyName',
        'a[href*="/cmp/"]'
      ],
      
      // Location selectors
      location: [
        '[data-testid*="location"] span',
        '[data-testid*="location"]',
        '[id*="location"]',
        '.location'
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
        '[data-testid*="salary"]'
      ]
    };

    // Broader searches for better job coverage
    this.searchQueries = [
      'entry level software engineer',
      'junior developer',
      'software intern 2025',
      'full stack developer entry level',
      'junior software engineer',
      'entry level data analyst',
      'software engineer new grad',
      'junior web developer',
      'entry level python developer',
      'junior react developer',
      'software engineer intern',
      'entry level backend developer'
    ];
  }

  // Initialize browser
  async initialize() {
    console.log('🚀 Starting Job Scraper...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      defaultViewport: { width: 1280, height: 720 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    console.log('✅ Browser initialized');
  }

  // Main scraping orchestrator
  async scrapeJobs(maxJobs = 50) {
    if (!this.browser) {
      await this.initialize();
    }

    const allJobs = [];
    let jobsCollected = 0;

    for (const query of this.searchQueries) {
      if (jobsCollected >= maxJobs) break;

      console.log(`\n🔍 Searching: "${query}"`);
      
      try {
        const jobsFromQuery = await this.scrapeSearchQuery(query, maxJobs - jobsCollected);
        allJobs.push(...jobsFromQuery);
        jobsCollected = allJobs.length;
        
        console.log(`✅ Collected ${jobsFromQuery.length} jobs from this search`);
        
        // Delay between searches to be respectful
        await this.delay(2000);
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

  // Scrape jobs from a single search query
  async scrapeSearchQuery(query, maxJobs = 20) {
    // Broader search without location restriction
    const searchURL = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&fromage=14&sort=date`;
    
    console.log(`📄 Navigating to: ${searchURL}`);
    await this.page.goto(searchURL, { waitUntil: 'networkidle0' });
    
    // Wait for search results to load with longer timeout and better fallbacks
    try {
      await this.page.waitForSelector('[data-jk], .jobsearch-SerpJobCard, .job_seen_beacon', { timeout: 15000 });
    } catch (error) {
      console.log(`⚠️  Primary selectors not found, trying alternative selectors...`);
      try {
        await this.page.waitForSelector('.slider_container, .jobsearch-NoResult', { timeout: 10000 });
      } catch (fallbackError) {
        throw new Error(`No job results found for query: ${query}`);
      }
    }
    
    await this.delay(2000);

    // Extract job URLs from search results
    const jobUrls = await this.extractJobUrlsFromSearch();
    console.log(`🔗 Found ${jobUrls.length} job URLs`);

    // Limit the number of jobs to scrape
    const urlsToScrape = jobUrls.slice(0, maxJobs);
    const jobs = [];

    for (let i = 0; i < urlsToScrape.length; i++) {
      const url = urlsToScrape[i];
      console.log(`📋 Scraping job ${i + 1}/${urlsToScrape.length}: ${url.substring(0, 60)}...`);
      
      try {
        const jobData = await this.scrapeIndividualJob(url);
        if (jobData) {
          jobs.push(jobData);
        }
        
        // Delay between individual job scrapes
        await this.delay(1500);
      } catch (error) {
        console.error(`❌ Error scraping job ${url}:`, error.message);
      }
    }

    return jobs;
  }

  // Extract job URLs from search results page
  async extractJobUrlsFromSearch() {
    return await this.page.evaluate(() => {
      const urls = [];
      
      // Try different selectors for job links with broader approach
      const linkSelectors = [
        '[data-jk] h2 a',
        '[data-jk] a[href*="/viewjob"]',
        '.jobTitle a',
        'h2 a[href*="/viewjob"]',
        'a[href*="/viewjob?jk="]',
        '.slider_item a[href*="/viewjob"]'
      ];
      
      for (const selector of linkSelectors) {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
          if (link.href && link.href.includes('/viewjob')) {
            urls.push(link.href);
          }
        });
        
        if (urls.length > 0) {
          console.log(`Found ${urls.length} job URLs with selector: ${selector}`);
          break; // Found links with this selector
        }
      }
      
      // If still no URLs, try a more aggressive approach
      if (urls.length === 0) {
        const allLinks = document.querySelectorAll('a[href*="/viewjob"]');
        allLinks.forEach(link => {
          if (link.href && link.href.includes('jk=')) {
            urls.push(link.href);
          }
        });
      }
      
      // Remove duplicates and clean URLs
      const cleanUrls = [...new Set(urls)].map(url => {
        try {
          const urlObj = new URL(url);
          // Keep only essential parameters
          const essentialParams = ['jk', 'tk'];
          for (const param of [...urlObj.searchParams.keys()]) {
            if (!essentialParams.includes(param)) {
              urlObj.searchParams.delete(param);
            }
          }
          return urlObj.toString();
        } catch (e) {
          return url;
        }
      });
      
      return cleanUrls;
    });
  }

  // Scrape individual job page (ported from your extension)
  async scrapeIndividualJob(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      await this.delay(2000);

      // Use your proven extraction logic
      const jobData = await this.page.evaluate(() => {
        // Helper function to find elements containing text
        const findElementsContainingText = (searchText) => {
          const allElements = document.querySelectorAll('*');
          const matchingElements = [];
          
          [...allElements].forEach(el => {
            if (el.textContent && el.textContent.includes(searchText) && el.children.length === 0) {
              matchingElements.push(el);
            }
          });
          
          return matchingElements;
        };

        // Selectors (copied from constructor)
        const selectors = {
          title: [
            '[data-testid="jobsearch-JobInfoHeader-title"] span',
            '.jobsearch-JobInfoHeader-title span',
            'h1 span[title]',
            'h2[data-testid="jobsearch-JobInfoHeader-title"] span',
            'h1', 'h2'
          ],
          company: [
            '[data-testid*="companyName"] a',
            '[data-testid*="companyName"]',
            '[id*="company"] a',
            '[id*="company"]',
            '.companyName a',
            '.companyName',
            'a[href*="/cmp/"]'
          ],
          location: [
            '[data-testid*="location"] span',
            '[data-testid*="location"]',
            '[id*="location"]',
            '.location'
          ],
          description: [
            '#jobDescriptionText',
            '.jobsearch-JobComponent-description',
            '[data-testid*="description"]'
          ],
          salary: [
            '.jobsearch-JobMetadataHeader-item',
            '.salary-snippet',
            '[data-testid*="salary"]'
          ]
        };

        // Extract title
        const extractTitle = () => {
          for (const selector of selectors.title) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
              return element.textContent.trim();
            }
          }
          
          // Fallback: look for text that looks like a job title
          const titleElements = findElementsContainingText('Engineer');
          for (const el of titleElements) {
            const text = el.textContent.trim();
            if (text.length < 100 && text.includes('Engineer')) {
              return text;
            }
          }
          
          return null;
        };

        // Extract company
        const extractCompany = () => {
          for (const selector of selectors.company) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
              return element.textContent.trim();
            }
          }
          
          // Look for company links
          const companyLinks = document.querySelectorAll('a[href*="/cmp/"]');
          for (const link of companyLinks) {
            if (link.textContent.trim() && link.textContent.trim().length < 100) {
              return link.textContent.trim();
            }
          }
          
          return null;
        };

        // Extract location
        const extractLocation = () => {
          for (const selector of selectors.location) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
              return element.textContent.trim();
            }
          }
          
          // Look for PA locations
          const locationElements = findElementsContainingText('PA ');
          for (const el of locationElements) {
            const text = el.textContent.trim();
            if (text.match(/\b[A-Z][a-z\s]+,\s*PA\s*\d{5}\b/)) {
              return text;
            }
          }
          
          return null;
        };

        // Extract description
        const extractDescription = () => {
          for (const selector of selectors.description) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
              return element.textContent.trim();
            }
          }
          return null;
        };

        // Extract salary - FIXED VERSION
        const extractSalary = () => {
          for (const selector of selectors.salary) {
            const element = document.querySelector(selector);
            if (element && element.textContent.includes('$')) {
              return element.textContent.trim();
            }
          }
          return null;
        };

        // Clean text function
        const cleanText = (text) => {
          if (!text) return null;
          return text.replace(/\s+/g, ' ').trim();
        };

        // Extract all data
        const title = extractTitle();
        const company = extractCompany();
        const location = extractLocation();
        const description = extractDescription();
        const salary = extractSalary();

        // Validate we have minimum required data
        if (!title && !company) {
          return null;
        }

        return {
          title: cleanText(title),
          company: cleanText(company),
          location: cleanText(location),
          description: description ? description.substring(0, 5000) : null,
          url: window.location.href,
          source: 'indeed',
          extracted_data: {
            page_type: 'indeed-job-detail',
            extracted_at: new Date().toISOString(),
            extraction_method: 'puppeteer-scraping',
            raw_salary: cleanText(salary)
          }
        };
      });

      // Parse salary on the Node.js side since methods aren't available in browser context
      if (jobData && jobData.extracted_data?.raw_salary) {
        jobData.salary_min = this.parseSalaryMin(jobData.extracted_data.raw_salary);
        jobData.salary_max = this.parseSalaryMax(jobData.extracted_data.raw_salary);
      }

      return jobData;
    } catch (error) {
      console.error(`Error scraping job at ${url}:`, error.message);
      return null;
    }
  }

  // Helper: Parse minimum salary from salary string
  parseSalaryMin(salaryText) {
    if (!salaryText) return null;
    
    // Look for salary patterns like "$50,000 - $70,000", "$25/hour", "$80K"
    const patterns = [
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, // $50,000 or $50000.00
      /(\d+)k/gi // 50k or 50K
    ];
    
    const numbers = [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(salaryText)) !== null) {
        let num = parseInt(match[1].replace(/,/g, ''));
        if (pattern.source.includes('k')) {
          num *= 1000; // Convert K to actual number
        }
        numbers.push(num);
      }
    }
    
    return numbers.length > 0 ? Math.min(...numbers) : null;
  }

  // Helper: Parse maximum salary from salary string
  parseSalaryMax(salaryText) {
    if (!salaryText) return null;
    
    const patterns = [
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d+)k/gi
    ];
    
    const numbers = [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(salaryText)) !== null) {
        let num = parseInt(match[1].replace(/,/g, ''));
        if (pattern.source.includes('k')) {
          num *= 1000;
        }
        numbers.push(num);
      }
    }
    
    return numbers.length > 0 ? Math.max(...numbers) : null;
  }

  // Save jobs to Supabase database
  async saveJobsToDatabase(jobs) {
    console.log(`\n💾 Saving ${jobs.length} jobs to database...`);
    
    // Use a special UUID for seed jobs that don't belong to any user
    const SEED_USER_ID = '11111111-1111-1111-1111-111111111111';
    
    const jobsToInsert = jobs
      .filter(job => job && job.title) // Only valid jobs
      .map(job => ({
        ...job,
        user_id: SEED_USER_ID, // Special ID for seed/public jobs
        posted_date: new Date().toISOString().split('T')[0], // Today's date
        job_type: this.detectJobType(job.title),
        experience_level: this.detectExperienceLevel(job.title, job.description),
        is_remote: this.detectRemote(job.title, job.description, job.location),
        tags: this.extractTags(job.title, job.description)
      }));

    let savedJobs = 0;
    const errors = [];

    // Insert jobs one by one to handle duplicates gracefully
    for (const job of jobsToInsert) {
      try {
        // Check if job already exists by URL
        const { data: existingJob } = await supabase
          .from('jobs')
          .select('id')
          .eq('url', job.url)
          .single();

        if (existingJob) {
          console.log(`⏭️  Job already exists, skipping: ${job.title}`);
          continue;
        }

        // Insert new job
        const { data, error } = await supabase
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
    
    if (errors.length > 0 && errors.length < 5) {
      console.log('\nError details:');
      errors.forEach(err => console.log(`  • ${err.job}: ${err.error}`));
    }

    return savedJobs;
  }

  // Helper: Detect job type from title
  detectJobType(title) {
    if (!title) return 'full-time';
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('intern')) return 'internship';
    if (titleLower.includes('contract') || titleLower.includes('freelance')) return 'contract';
    if (titleLower.includes('part-time')) return 'part-time';
    
    return 'full-time';
  }

  // Helper: Detect experience level
  detectExperienceLevel(title, description) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    
    if (text.includes('intern') || text.includes('student')) return 'internship';
    if (text.includes('entry level') || text.includes('junior') || text.includes('new grad')) return 'entry-level';
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'senior';
    if (text.includes('mid-level') || text.includes('intermediate')) return 'mid-level';
    
    return 'entry-level'; // Default for our target audience
  }

  // Helper: Detect remote work
  detectRemote(title, description, location) {
    const text = `${title || ''} ${description || ''} ${location || ''}`.toLowerCase();
    return text.includes('remote') || text.includes('work from home');
  }

  // Helper: Extract relevant tags
  extractTags(title, description) {
    const text = `${title || ''} ${description || ''}`.toLowerCase();
    const tags = [];
    
    // Tech stack detection
    const techKeywords = [
      'javascript', 'react', 'node.js', 'python', 'java', 'typescript',
      'aws', 'docker', 'kubernetes', 'sql', 'postgresql', 'mongodb',
      'agile', 'scrum', 'ci/cd', 'git', 'api', 'rest', 'graphql'
    ];
    
    techKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return tags.slice(0, 10); // Limit to 10 tags
  }

  // Clean up resources
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  // Helper: Delay function
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { JobScraperService };
