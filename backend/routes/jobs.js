// =====================================================
// JOBS ROUTES (routes/jobs.js)
// =====================================================

const express = require('express');
const { supabase } = require('../config/database');
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

    let query = supabase
      .from('jobs_with_status') // Use the view we created
      .select('*')
      .eq('user_id', req.userId);

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
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id - Get specific job
router.get('/:id', async (req, res) => {
  try {
    const { data: job, error } = await supabase
      .from('jobs_with_status')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// POST /api/jobs - Create new job
router.post('/', validate('job'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      user_id: req.userId
    };

    const { data: job, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', validate('job'), async (req, res) => {
  try {
    const { data: job, error } = await supabase
      .from('jobs')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
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

    const { data: createdJobs, error } = await supabase
      .from('jobs')
      .insert(jobsWithUserId)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: `${createdJobs.length} jobs created successfully`,
      jobs: createdJobs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create jobs' });
  }
});

// GET /api/jobs/stats/summary - Get user's job statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from('user_application_stats')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is OK
      return res.status(400).json({ error: error.message });
    }

    const { data: jobCount } = await supabase
      .from('jobs')
      .select('id', { count: 'exact' })
      .eq('user_id', req.userId);

    res.json({
      total_jobs: jobCount?.length || 0,
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
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
