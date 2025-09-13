// =====================================================
// GLOBAL JOBS ROUTES - For Chrome Extension Data Collection
// =====================================================

const express = require('express');
const { supabase } = require('../config/database');
const { validate } = require('../middleware/validation');
const router = express.Router();

// POST /api/global/jobs - Save job to global database (no auth required)
router.post('/jobs', async (req, res) => {
  try {
    console.log('🌍 Global job request received:', req.body);
    
    // Validate required fields
    if (!req.body.title || !req.body.company) {
      return res.status(400).json({ 
        error: 'Title and company are required',
        received: req.body
      });
    }

    const jobData = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location || null,
      url: req.body.url || null,
      description: req.body.description || null,
      source: req.body.source || 'unknown',
      user_id: null, // Mark as global job
      is_global: true,
      extracted_data: req.body.extracted_data || {}
    };

    console.log('📝 Processed job data:', jobData);

    // Check if job already exists by URL to avoid duplicates
    if (jobData.url) {
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('url', jobData.url)
        .eq('is_global', true)
        .single();

      if (existingJob) {
        console.log('📋 Duplicate job found:', existingJob.id);
        return res.json({
          message: 'Job already exists in global database',
          job_id: existingJob.id,
          created: false
        });
      }
    }

    // Insert new global job
    console.log('💾 Inserting job into database...');
    const { data: job, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) {
      console.error('❌ Global job insert error:', error);
      return res.status(400).json({ 
        error: error.message,
        details: error.details || 'No additional details',
        jobData: jobData
      });
    }

    console.log('✅ Job saved successfully:', job.id);
    res.status(201).json({
      message: 'Job saved to global database',
      job_id: job.id,
      created: true,
      job: job
    });
  } catch (error) {
    console.error('💥 Global job save error:', error);
    res.status(500).json({ 
      error: 'Failed to save job to global database',
      message: error.message
    });
  }
});

// GET /api/global/jobs - Get global jobs (no auth required)
router.get('/jobs', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      company, 
      location, 
      source,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_global', true);

    // Apply filters
    if (company) {
      query = query.ilike('company', `%${company}%`);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (source) {
      query = query.eq('source', source);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting and pagination
    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: jobs, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global jobs' });
  }
});

// GET /api/global/jobs/stats - Get global job statistics
router.get('/jobs/stats', async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from('jobs')
      .select('source, company, created_at', { count: 'exact' })
      .eq('is_global', true);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Calculate statistics
    const totalJobs = stats.length;
    const companyCounts = stats.reduce((acc, job) => {
      acc[job.company] = (acc[job.company] || 0) + 1;
      return acc;
    }, {});
    
    const sourceCounts = stats.reduce((acc, job) => {
      acc[job.source] = (acc[job.source] || 0) + 1;
      return acc;
    }, {});

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentJobs = stats.filter(job => new Date(job.created_at) >= lastWeek).length;

    res.json({
      total_jobs: totalJobs,
      jobs_this_week: recentJobs,
      top_companies: Object.entries(companyCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([company, count]) => ({ company, count })),
      by_source: sourceCounts
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch global job statistics' });
  }
});

module.exports = router;
