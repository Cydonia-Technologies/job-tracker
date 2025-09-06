// =====================================================
// AI ROUTES (routes/ai.js)
// =====================================================

const express = require('express');
const { supabase } = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const { analyzeJobMatch, optimizeResume, generateCompanyResearch } = require('../services/aiService');
const router = express.Router();

// Apply authentication to all AI routes
router.use(authenticateUser);

// POST /api/ai/job-match - Analyze job match score
router.post('/job-match', async (req, res) => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'job_id is required' });
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', req.userId)
      .single();

    if (jobError) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.userId)
      .single();

    if (profileError) {
      return res.status(400).json({ error: 'User profile not found. Please complete your profile first.' });
    }

    // Analyze job match
    const analysis = await analyzeJobMatch(profile, job);

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_analysis')
      .insert({
        user_id: req.userId,
        job_id: job_id,
        analysis_type: 'job_match_score',
        match_score: analysis.match_score,
        suggestions: analysis.suggestions,
        raw_response: analysis.raw_response,
        model_used: analysis.model_used,
        tokens_used: analysis.tokens_used,
        cost_usd: analysis.cost_usd,
        processing_time_ms: analysis.processing_time_ms
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save analysis:', saveError);
    }

    res.json({
      job_id,
      match_score: analysis.match_score,
      suggestions: analysis.suggestions,
      analysis_id: savedAnalysis?.id
    });
  } catch (error) {
    console.error('Job match analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze job match' });
  }
});

// POST /api/ai/resume-optimization - Get resume optimization suggestions
router.post('/resume-optimization', async (req, res) => {
  try {
    const { job_id, resume_text } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'job_id is required' });
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', req.userId)
      .single();

    if (jobError) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // If no resume text provided, try to get from user profile
    let resumeContent = resume_text;
    if (!resumeContent) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('current_resume_url')
        .eq('user_id', req.userId)
        .single();

      if (!profile?.current_resume_url) {
        return res.status(400).json({ error: 'Resume text or uploaded resume required' });
      }

      // In a real implementation, you'd fetch and parse the PDF from the URL
      return res.status(400).json({ error: 'Please provide resume text or upload a new resume' });
    }

    // Optimize resume
    const optimization = await optimizeResume(resumeContent, job);

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_analysis')
      .insert({
        user_id: req.userId,
        job_id: job_id,
        analysis_type: 'resume_optimization',
        suggestions: optimization.suggestions,
        raw_response: optimization.raw_response,
        model_used: optimization.model_used,
        tokens_used: optimization.tokens_used,
        cost_usd: optimization.cost_usd,
        processing_time_ms: optimization.processing_time_ms
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save analysis:', saveError);
    }

    res.json({
      job_id,
      suggestions: optimization.suggestions,
      analysis_id: savedAnalysis?.id
    });
  } catch (error) {
    console.error('Resume optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

// POST /api/ai/company-research - Generate company research
router.post('/company-research', async (req, res) => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'job_id is required' });
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', req.userId)
      .single();

    if (jobError) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Generate company research
    const research = await generateCompanyResearch(job);

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_analysis')
      .insert({
        user_id: req.userId,
        job_id: job_id,
        analysis_type: 'company_research',
        suggestions: research.insights,
        raw_response: research.raw_response,
        model_used: research.model_used,
        tokens_used: research.tokens_used,
        cost_usd: research.cost_usd,
        processing_time_ms: research.processing_time_ms
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save analysis:', saveError);
    }

    res.json({
      job_id,
      company_insights: research.insights,
      analysis_id: savedAnalysis?.id
    });
  } catch (error) {
    console.error('Company research error:', error);
    res.status(500).json({ error: 'Failed to generate company research' });
  }
});

// GET /api/ai/analysis/:job_id - Get all AI analysis for a job
router.get('/analysis/:job_id', async (req, res) => {
  try {
    const { data: analyses, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('job_id', req.params.job_id)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI analysis' });
  }
});

// GET /api/ai/usage-stats - Get AI usage statistics for user
router.get('/usage-stats', async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from('ai_analysis')
      .select('analysis_type, tokens_used, cost_usd, created_at')
      .eq('user_id', req.userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Calculate totals
    const totalTokens = stats.reduce((sum, stat) => sum + (stat.tokens_used || 0), 0);
    const totalCost = stats.reduce((sum, stat) => sum + (parseFloat(stat.cost_usd) || 0), 0);
    const analysisCount = stats.length;

    // Group by analysis type
    const byType = stats.reduce((acc, stat) => {
      acc[stat.analysis_type] = (acc[stat.analysis_type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      last_30_days: {
        total_analyses: analysisCount,
        total_tokens: totalTokens,
        total_cost_usd: totalCost.toFixed(6),
        by_type: byType
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

module.exports = router;

