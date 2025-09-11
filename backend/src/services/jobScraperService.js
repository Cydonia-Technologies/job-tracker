// =====================================================
// SIMPLE JOB SCRAPER - Search Results Only
// =====================================================

const puppeteer = require('puppeteer');
const { supabase } = require('../config/database');

class JobScraperService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.source = 'indeed';
    
    // Broader searches for better job coverage
    this.searchQueries = [
      'entry level software engineer',
      'junior developer',
      'software intern 2025',
      'full stack developer entry level',
      'junior software engineer',
      'entry level data analyst',
      'software engineer new grad',
      'junior web developer'
    ];
  }

  // Initialize browser
  async initialize() {
    console.log('🚀 Starting Job Scraper...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    console.log('✅ Browser initialized');
  }

  // Main scraping orchestrator  
  async scrapeJobs(maxJobs = 50) {
    if (!this.browser) {
      await this.initialize();
    }

    // First, test a simple navigation to Indeed homepage
    console.log('🌐 Testing Indeed access...');
    try {
      await this.page.goto('https://www.indeed.com', { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(2000);
      console.log('✅ Successfully accessed Indeed homepage');
    } catch (error) {
      console.error('❌ Failed to access Indeed homepage:', error.message);
      console.log('This might indicate network issues or Indeed blocking access');
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
        
        // Random delay between searches to look more human
        const delay = 3000 + Math.random() * 2000; // 3-5 seconds
        console.log(`⏱️  Waiting ${Math.round(delay/1000)}s before next search...`);
        await this.delay(delay);
      } catch (error) {
        console.error(`❌ Error with query "${query}":`, error.message);
        // Take a screenshot for debugging
        try {
          await this.page.screenshot({ path: `error-${query.replace(/\s+/g, '-')}.png` });
          console.log(`📸 Error screenshot saved`);
        } catch (screenshotError) {
          console.log('Could not take error screenshot');
        }
      }
    }

    console.log(`\n🎉 Total jobs collected: ${allJobs.length}`);
    
    // Save to database
    if (allJobs.length > 0) {
      await this.saveJobsToDatabase(allJobs);
    }

    return allJobs;
  }

  // Scrape ONLY the search results page (NO navigation to individual jobs)
  async scrapeSearchResultsPage(query) {
    const searchURL = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&fromage=14&sort=date`;
    
    console.log(`📄 Loading search page: ${searchURL}`);
    await this.page.goto(searchURL, { waitUntil: 'networkidle0' });
    
    // Wait for job cards to load
    await this.page.waitForSelector('[data-jk], .jobsearch-SerpJobCard', { timeout: 15000 });
    await this.delay(2000);

    console.log(`📋 Extracting jobs directly from search results page...`);

    // Extract job data from THIS PAGE ONLY - no navigation
    const jobs = await this.page.evaluate(() => {
      const extractedJobs = [];
      
      // Find all job cards on the current page
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
          
          // Extract description/summary
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
              url: window.location.href + `#job-${index}`, // Use search page URL
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
  }

  // Save jobs to database (same as before)
  async saveJobsToDatabase(jobs) {
    console.log(`\n💾 Saving ${jobs.length} jobs to database...`);
    
    const SEED_USER_ID = '11111111-1111-1111-1111-111111111111';
    const jobsToInsert = jobs
      .filter(job => job && job.title)
      .map(job => ({
        ...job,
        user_id: SEED_USER_ID,
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
        const { data: existingJob } = await supabase
          .from('jobs')
          .select('id')
          .eq('url', job.url)
          .single();

        if (existingJob) {
          console.log(`⏭️  Job already exists, skipping: ${job.title}`);
          continue;
        }

        const { data, error } = await supabaseClient
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

  // Helper methods (same as before)
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
