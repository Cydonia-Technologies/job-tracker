 // =====================================================
// USERS ROUTES (routes/users.js)
// =====================================================

const express = require('express');
const { supabase } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Apply authentication to all user routes
router.use(authenticateUser);

// GET /api/users/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, return empty profile
      return res.json({
        user_id: req.userId,
        first_name: null,
        last_name: null,
        skills: [],
        target_roles: [],
        target_locations: [],
        experience_years: 0
      });
    }

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', validate('userProfile'), async (req, res) => {
  try {
    const profileData = {
      ...req.body,
      user_id: req.userId
    };

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/users/resume - Upload and parse resume
router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Parse PDF to extract text
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    // Upload file to Supabase Storage
    const fileName = `resumes/${req.userId}/${Date.now()}-${req.file.originalname}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return res.status(400).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // Update user profile with resume URL
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: req.userId,
        current_resume_url: publicUrl
      })
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    res.json({
      message: 'Resume uploaded successfully',
      resume_url: publicUrl,
      resume_text: resumeText.substring(0, 1000), // First 1000 chars for preview
      profile
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// GET /api/users/activity - Get user activity log
router.get('/activity', async (req, res) => {
  try {
    const { page = 1, limit = 20, action } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', req.userId);

    if (action) {
      query = query.eq('action', action);
    }

    const { data: activities, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

module.exports = router;
