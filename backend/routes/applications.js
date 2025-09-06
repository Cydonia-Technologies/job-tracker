// =====================================================
// APPLICATIONS ROUTES (routes/applications.js)
// =====================================================

const express = require('express');
const { supabase } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const router = express.Router();

// Apply authentication to all application routes
router.use(authenticateUser);

// GET /api/applications - Get all applications for user
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('applications')
      .select(`
        *,
        job:jobs(
          id,
          title,
          company,
          location,
          url
        )
      `)
      .eq('user_id', req.userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET /api/applications/:id - Get specific application
router.get('/:id', async (req, res) => {
  try {
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// POST /api/applications - Create new application
router.post('/', validate('application'), async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      user_id: req.userId
    };

    const { data: application, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select(`
        *,
        job:jobs(
          id,
          title,
          company,
          location
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// PUT /api/applications/:id - Update application
router.put('/:id', validate('application'), async (req, res) => {
  try {
    const { data: application, error } = await supabase
      .from('applications')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select(`
        *,
        job:jobs(
          id,
          title,
          company,
          location
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// PATCH /api/applications/:id/status - Update only application status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updateData = { status };
    
    // Automatically set applied_date when status changes to 'applied'
    if (status === 'applied' && !req.body.applied_date) {
      updateData.applied_date = new Date().toISOString().split('T')[0];
    }

    const { data: application, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// DELETE /api/applications/:id - Delete application
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
