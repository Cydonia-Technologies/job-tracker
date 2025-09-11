 // =====================================================
// USERS ROUTES (routes/users.js)
// =====================================================

const express = require('express');
const { supabase } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {parseResumeDate} = require('../services/aiService');
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


// POST /api/users/resume 
router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Parse PDF to extract text (existing functionality)
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ 
        error: 'Could not extract readable text from PDF. Please ensure the file is not password protected or image-only.' 
      });
    }

    // Upload file to Supabase Storage (existing functionality)
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

    // Get public URL (existing functionality)
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // NEW: AI-powered resume parsing
    console.log('Starting AI resume parsing...');
    const startTime = Date.now();
    
    const aiParsingResult = await parseResumeData(resumeText);
    const { parsed_data, metadata } = aiParsingResult;
    
    console.log(`Resume parsing completed in ${metadata.processing_time_ms}ms, cost: $${metadata.cost_usd}`);

    // NEW: Update user profile with enhanced data
    const profileData = {
      user_id: req.userId,
      current_resume_url: publicUrl,
      resume_text: resumeText,
      // Store parsed data for quick access
      parsed_skills: parsed_data.skills,
      parsed_experience: parsed_data.experience,
      parsed_education: parsed_data.education,
      parsed_contact: parsed_data.contact,
      resume_summary: parsed_data.summary,
      // Store metadata
      parsing_metadata: {
        ...metadata,
        parsed_at: new Date().toISOString(),
        resume_filename: req.file.originalname
      }
    };

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return res.status(400).json({ error: profileError.message });
    }

    // NEW: Enhanced response with structured data
    res.json({
      message: 'Resume uploaded and analyzed successfully',
      resume_url: publicUrl,
      resume_text_preview: resumeText.substring(0, 500), // First 500 chars for preview
      parsed_data: {
        skills: parsed_data.skills,
        experience: parsed_data.experience,
        education: parsed_data.education,
        contact: parsed_data.contact,
        summary: parsed_data.summary
      },
      analysis_metadata: {
        processing_time_ms: metadata.processing_time_ms,
        model_used: metadata.model_used,
        cost_usd: metadata.cost_usd,
        total_skills_found: (parsed_data.skills?.technical?.length || 0) + 
                           (parsed_data.skills?.soft?.length || 0) + 
                           (parsed_data.skills?.tools?.length || 0),
        experience_years: parsed_data.experience?.total_years || 0
      },
      profile
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload and analyze resume',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// NEW: Get parsed resume data endpoint
router.get('/resume/parsed', async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        parsed_skills,
        parsed_experience,
        parsed_education,
        parsed_contact,
        resume_summary,
        parsing_metadata,
        current_resume_url
      `)
      .eq('user_id', req.userId)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ 
        error: 'No resume found. Please upload a resume first.' 
      });
    }

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!profile.parsed_skills) {
      return res.status(404).json({ 
        error: 'Resume not yet parsed. Please re-upload your resume for analysis.' 
      });
    }

    res.json({
      has_resume: !!profile.current_resume_url,
      resume_url: profile.current_resume_url,
      parsed_data: {
        skills: profile.parsed_skills,
        experience: profile.parsed_experience,
        education: profile.parsed_education,
        contact: profile.parsed_contact,
        summary: profile.resume_summary
      },
      metadata: profile.parsing_metadata
    });
  } catch (error) {
    console.error('Get parsed resume error:', error);
    res.status(500).json({ error: 'Failed to fetch parsed resume data' });
  }
});

// NEW: Re-parse existing resume endpoint
router.post('/resume/reparse', async (req, res) => {
  try {
    // Get existing resume text
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('resume_text, current_resume_url')
      .eq('user_id', req.userId)
      .single();

    if (profileError || !profile.resume_text) {
      return res.status(404).json({ 
        error: 'No resume text found. Please upload a resume first.' 
      });
    }

    // Re-parse with AI
    console.log('Starting AI re-parsing...');
    const aiParsingResult = await parseResumeData(profile.resume_text);
    const { parsed_data, metadata } = aiParsingResult;

    // Update profile with new parsed data
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        parsed_skills: parsed_data.skills,
        parsed_experience: parsed_data.experience,
        parsed_education: parsed_data.education,
        parsed_contact: parsed_data.contact,
        resume_summary: parsed_data.summary,
        parsing_metadata: {
          ...metadata,
          parsed_at: new Date().toISOString(),
          reparse: true
        }
      })
      .eq('user_id', req.userId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: 'Resume re-parsed successfully',
      parsed_data: {
        skills: parsed_data.skills,
        experience: parsed_data.experience,
        education: parsed_data.education,
        contact: parsed_data.contact,
        summary: parsed_data.summary
      },
      analysis_metadata: {
        processing_time_ms: metadata.processing_time_ms,
        model_used: metadata.model_used,
        cost_usd: metadata.cost_usd,
        total_skills_found: (parsed_data.skills?.technical?.length || 0) + 
                           (parsed_data.skills?.soft?.length || 0) + 
                           (parsed_data.skills?.tools?.length || 0),
        experience_years: parsed_data.experience?.total_years || 0
      }
    });
  } catch (error) {
    console.error('Resume reparse error:', error);
    res.status(500).json({ error: 'Failed to re-parse resume' });
  }
});
module.exports = router;
