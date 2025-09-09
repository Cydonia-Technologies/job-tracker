// =====================================================
// AI SERVICE - With External Prompt Files
// =====================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Prompt loading and templating utilities
const promptsDir = path.join(__dirname, '../prompts');

const loadPrompt = (filename) => {
  try {
    const promptPath = path.join(promptsDir, filename);
    return fs.readFileSync(promptPath, 'utf8');
  } catch (error) {
    console.error(`Failed to load prompt file: ${filename}`, error);
    throw new Error(`Prompt file not found: ${filename}`);
  }
};

const replaceVariables = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || 'Not specified');
  }
  return result;
};

// Helper function to estimate tokens (rough approximation)
const estimateTokens = (text) => {
  return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
};

// Helper function to calculate cost
const calculateCost = (inputTokens, outputTokens, model = 'gemini-1.5-flash') => {
  const rates = {
    'gemini-1.5-flash': {
      input: 0.000075 / 1000,  // $0.000075 per 1K tokens
      output: 0.0003 / 1000    // $0.0003 per 1K tokens
    }
  };
  
  const rate = rates[model] || rates['gemini-1.5-flash'];
  return (inputTokens * rate.input) + (outputTokens * rate.output);
};

// Grade resume without authentication
const gradeResume = async (resumeText) => {
  const startTime = Date.now();
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Load and populate prompt template
    const promptTemplate = loadPrompt('resume-grading.txt');
    const prompt = replaceVariables(promptTemplate, {
      RESUME_TEXT: resumeText
    });

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    });

    const response = result.response.text();
    const processingTime = Date.now() - startTime;
    
    // Clean the response - remove any markdown formatting
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    
    // Parse JSON response
    const analysis = JSON.parse(cleanedResponse);
    
    // Calculate token usage and cost
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(response);
    const cost = calculateCost(inputTokens, outputTokens);
    
    return {
      overall_score: analysis.overall_score,
      category_scores: analysis.category_scores,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      critical_issues: analysis.critical_issues,
      recommendation: analysis.recommendation,
      metadata: {
        model_used: 'gemini-1.5-flash',
        tokens_used: inputTokens + outputTokens,
        cost_usd: cost,
        processing_time_ms: processingTime
      }
    };
  } catch (error) {
    console.error('Resume grading error:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
};

// Analyze job match score
const analyzeJobMatch = async (userProfile, job) => {
  const startTime = Date.now();
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Load and populate prompt template
    const promptTemplate = loadPrompt('job-matching.txt');
    const prompt = replaceVariables(promptTemplate, {
      USER_SKILLS: JSON.stringify(userProfile.skills || []),
      USER_EXPERIENCE: userProfile.experience_years || 0,
      USER_TARGET_ROLES: JSON.stringify(userProfile.target_roles || []),
      USER_TARGET_LOCATIONS: JSON.stringify(userProfile.target_locations || []),
      JOB_TITLE: job.title,
      JOB_COMPANY: job.company,
      JOB_LOCATION: job.location || 'Not specified',
      JOB_DESCRIPTION: job.description || 'No description available'
    });

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    });

    const response = result.response.text();
    const processingTime = Date.now() - startTime;
    
    // Clean and parse JSON response
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanedResponse);
    
    // Calculate token usage and cost
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(response);
    const cost = calculateCost(inputTokens, outputTokens);
    
    return {
      match_score: analysis.match_score,
      suggestions: {
        skills_match: analysis.skills_match,
        experience_match: analysis.experience_match,
        location_match: analysis.location_match,
        overall_assessment: analysis.overall_assessment,
        strengths: analysis.strengths,
        gaps: analysis.gaps,
        recommendations: analysis.recommendations
      },
      raw_response: response,
      model_used: 'gemini-1.5-flash',
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      processing_time_ms: processingTime
    };
  } catch (error) {
    console.error('Job match analysis error:', error);
    throw new Error('Failed to analyze job match');
  }
};

// Optimize resume for job
const optimizeResume = async (resumeText, job) => {
  const startTime = Date.now();
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Load and populate prompt template
    const promptTemplate = loadPrompt('resume-optimization.txt');
    const prompt = replaceVariables(promptTemplate, {
      RESUME_TEXT: resumeText,
      JOB_TITLE: job.title,
      JOB_COMPANY: job.company,
      JOB_DESCRIPTION: job.description || 'No description available'
    });

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    });

    const response = result.response.text();
    const processingTime = Date.now() - startTime;
    
    // Clean and parse JSON response
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const optimization = JSON.parse(cleanedResponse);
    
    // Calculate token usage and cost
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(response);
    const cost = calculateCost(inputTokens, outputTokens);
    
    return {
      suggestions: optimization,
      raw_response: response,
      model_used: 'gemini-1.5-flash',
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      processing_time_ms: processingTime
    };
  } catch (error) {
    console.error('Resume optimization error:', error);
    throw new Error('Failed to optimize resume');
  }
};

// Generate company research
const generateCompanyResearch = async (job) => {
  const startTime = Date.now();
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Load and populate prompt template
    const promptTemplate = loadPrompt('company-research.txt');
    const prompt = replaceVariables(promptTemplate, {
      JOB_COMPANY: job.company,
      JOB_TITLE: job.title,
      JOB_DESCRIPTION: job.description || 'No description available',
      JOB_LOCATION: job.location || 'Not specified'
    });

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200
      }
    });

    const response = result.response.text();
    const processingTime = Date.now() - startTime;
    
    // Clean and parse JSON response
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const research = JSON.parse(cleanedResponse);
    
    // Calculate token usage and cost
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(response);
    const cost = calculateCost(inputTokens, outputTokens);
    
    return {
      insights: research,
      raw_response: response,
      model_used: 'gemini-1.5-flash',
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      processing_time_ms: processingTime
    };
  } catch (error) {
    console.error('Company research error:', error);
    throw new Error('Failed to generate company research');
  }
};

module.exports = {
  gradeResume,
  analyzeJobMatch,
  optimizeResume,
  generateCompanyResearch
};
