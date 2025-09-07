// =====================================================
// JOBS ROUTES (routes/jobs.js) - Admin Client Version
// =====================================================

const express = require('express');
const { supabaseAdmin } = require('../config/database'); // Use admin client
const { authenticateUser } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const router = express.Router();

// Apply authentication to all job routes
router.use(authenticateUser);

// GET /api/jobs - Get all jobs for user with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      company, 
      location, 
      source,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('jobs_with_status') // Use the view we created
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId); // Manual user filtering

    // Apply filters
    if (status) {
      query = query.eq('application_status', status);
    }
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
      console.error('Failed to fetch jobs:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      jobs: jobs || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id - Get specific job
router.get('/:id', async (req, res) => {
  try {
    const { data: job, error } = await supabaseAdmin
      .from('jobs_with_status')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId) // Manual user filtering
      .single();

    if (error) {
      console.error('Job fetch error:', error);
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Job fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// POST /api/jobs - Create new job
router.post('/', validate('job'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      user_id: req.userId // Set from auth middleware
    };

    console.log('Creating job for user:', req.userId);
    console.log('Job data:', jobData);

    // Use admin client to bypass RLS
    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) {
      console.error('Job creation error:', error);
      return res.status(400).json({ 
        error: error.message,
        details: error.details || 'Unknown database error'
      });
    }

    console.log('Job created successfully:', job.id);
    res.status(201).json(job);
  } catch (error) {
    console.error('Failed to create job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', validate('job'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.userId) // Manual user filtering
      .select()
      .single();

    if (error) {
      console.error('Job update error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found or access denied' });
    }

    res.json(job);
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId); // Manual user filtering

    if (error) {
      console.error('Job deletion error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Job deletion error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// POST /api/jobs/bulk - Bulk create jobs (for extension)
router.post('/bulk', async (req, res) => {
  try {
    const { jobs } = req.body;
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ error: 'Jobs array is required' });
    }

    const jobsWithUserId = jobs.map(job => ({
      ...job,
      user_id: req.userId
    }));

    const { data: createdJobs, error } = await supabaseAdmin
      .from('jobs')
      .insert(jobsWithUserId)
      .select();

    if (error) {
      console.error('Bulk job creation error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: `${createdJobs.length} jobs created successfully`,
      jobs: createdJobs
    });
  } catch (error) {
    console.error('Bulk job creation error:', error);
    res.status(500).json({ error: 'Failed to create jobs' });
  }
});

// GET /api/jobs/stats/summary - Get user's job statistics
router.get('/stats/summary', async (req, res) => {
  try {
    // Get application stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_application_stats')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    // Get job count
    const { data: jobData, error: jobError, count: jobCount } = await supabaseAdmin
      .from('jobs')
      .select('id', { count: 'exact' })
      .eq('user_id', req.userId);

    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = not found, which is OK
      console.error('Stats fetch error:', statsError);
      return res.status(400).json({ error: statsError.message });
    }

    if (jobError) {
      console.error('Job count error:', jobError);
      return res.status(400).json({ error: jobError.message });
    }

    res.json({
      total_jobs: jobCount || 0,
      ...stats || {
        total_applications: 0,
        applied_count: 0,
        interviewing_count: 0,
        offered_count: 0,
        rejected_count: 0,
        interview_rate_percent: 0
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
