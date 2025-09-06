// =====================================================
// AI SERVICE (services/aiService.js)
// =====================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

// Analyze job match score
const analyzeJobMatch = async (userProfile, job) => {
  const startTime = Date.now();
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
Analyze the compatibility between this candidate and job posting. Provide a detailed analysis in JSON format.

CANDIDATE PROFILE:
- Skills: ${JSON.stringify(userProfile.skills || [])}
- Experience: ${userProfile.experience_years || 0} years
- Target Roles: ${JSON.stringify(userProfile.target_roles || [])}
- Target Locations: ${JSON.stringify(userProfile.target_locations || [])}

JOB POSTING:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location || 'Not specified'}
- Description: ${job.description || 'No description available'}
- Requirements: ${job.extracted_data?.requirements || 'See description'}

Analyze and respond with ONLY valid JSON in this exact format:
{
  "match_score": 85,
  "skills_match": 90,
  "experience_match": 80,
  "location_match": 95,
  "overall_assessment": "Strong match with excellent skill alignment",
  "strengths": ["React expertise matches requirements", "Location preference aligns"],
  "gaps": ["Could benefit from more backend experience", "Certification in AWS would be helpful"],
  "recommendations": ["Highlight React projects in application", "Consider AWS certification"]
}

Provide scores out of 100 and be specific about strengths and gaps.
`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    });

    const response = result.response.text();
    const processingTime = Date.now() - startTime;
    
    // Parse JSON response
    const analysis = JSON.parse(response);
    
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
    
    const prompt = `
Analyze this resume against the job posting and provide specific optimization suggestions.

RESUME CONTENT:
${resumeText}

JOB POSTING:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description || 'No description available'}

Analyze and provide ONLY valid JSON in this exact format:
{
  "keyword_suggestions": ["React", "Node.js", "AWS"],
  "skills_to_highlight": ["JavaScript proficiency", "Team leadership"],
  "experience_adjustments": ["Emphasize backend development projects", "Quantify achievements with metrics"],
  "section_recommendations": {
    "summary": "Add a professional summary highlighting relevant experience",
    "skills": "Move technical skills section higher",
    "experience": "Use action verbs and quantify achievements"
  },
  "missing_keywords": ["Agile", "CI/CD", "REST APIs"],
  "overall_score": 78,
  "priority_changes": ["Add missing keywords", "Quantify achievements", "Reorder sections"]
}

Be specific and actionable with suggestions.
`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    });

    const response = result.response.text();
    const processingTime = Date.now() - startTime;
    
    // Parse JSON response
    const optimization = JSON.parse(response);
    
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
    
    const prompt = `
Generate company research and talking points for this job application.

COMPANY: ${job.company}
JOB TITLE: ${job.title}
JOB DESCRIPTION: ${job.description || 'No description available'}
LOCATION: ${job.location || 'Not specified'}

Provide research and talking points in JSON format:
{
  "company_overview": "Brief description of the company, industry, and business model",
  "recent_news": ["Recent company news or developments"],
  "company_values": ["Core values and culture insights"],
  "talking_points": [
    "Why you're interested in this specific company",
    "How your skills align with their needs",
    "Questions to ask during interviews"
  ],
  "interview_prep": {
    "likely_questions": ["Tell me about yourself", "Why do you want to work here?"],
    "company_specific_questions": ["Questions specific to this company/role"]
  },
  "application_tips": ["Tips for tailoring application to this company"]
}

Focus on actionable insights for job application and interview preparation.
`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200
      }
    });

    const response = result.response.text();
    const processingTime = Date.now() - startTime;
    
    // Parse JSON response
    const research = JSON.parse(response);
    
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
  analyzeJobMatch,
  optimizeResume,
  generateCompanyResearch
};
