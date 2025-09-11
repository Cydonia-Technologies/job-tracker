// =====================================================
// SCRAPER RUNNER SCRIPT - Run Job Scraping
// =====================================================

// IMPORTANT: Load environment variables FIRST before any other imports
require('dotenv').config();

const { JobScraperService } = require('./services/jobScraperService');

async function main() {
  console.log('🎯 JobTracker Database Population Script');
  console.log('==========================================\n');
  
  const args = process.argv.slice(2);
  const maxJobs = args[0] ? parseInt(args[0]) : 50;
  
  console.log(`Target: ${maxJobs} jobs from Indeed`);
  console.log(`Focus: Entry-level tech jobs (nationwide search)\n`);

  const scraper = new JobScraperService();
  let jobs = [];
  
  try {
    console.log('🚀 Initializing browser...');
    await scraper.initialize();
    
    console.log('🔍 Starting job extraction...');
    jobs = await scraper.scrapeJobs(maxJobs);
    
    console.log('\n📊 SCRAPING SUMMARY');
    console.log('==================');
    console.log(`✅ Jobs collected: ${jobs.length}`);
    console.log(`💾 Jobs saved to database: ${jobs.filter(j => j).length}`);
    
    if (jobs.length > 0) {
      console.log('\n📋 Sample Jobs:');
      jobs.slice(0, 3).forEach((job, i) => {
        console.log(`${i + 1}. ${job.title} at ${job.company}`);
        console.log(`   📍 ${job.location || 'Location not specified'}`);
        console.log(`   🔗 ${job.url.substring(0, 60)}...`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ SCRAPING FAILED');
    console.error('================');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your internet connection');
    console.error('2. Verify Supabase environment variables');
    console.error('3. Make sure Indeed is accessible');
  } finally {
    await scraper.cleanup();
  }
  
  console.log('\n🎉 Scraping complete!');
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal, cleaning up...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main();
