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

/**
 * Extract structured data from resume text using AI
 * @param {string} resumeText - Raw text extracted from PDF
 * @returns {Object} Structured resume data for job matching
 */
const parseResumeData = async (resumeText) => {
  const startTime = Date.now();
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
Extract structured information from this resume for job matching analysis.

RESUME TEXT:
${resumeText}

Extract and return ONLY valid JSON in this exact format:
{
  "skills": {
    "technical": ["JavaScript", "React", "Python", "SQL"],
    "soft": ["Leadership", "Communication", "Problem Solving"],
    "tools": ["Git", "AWS", "Docker", "Figma"]
  },
  "experience": {
    "total_years": 3,
    "current_level": "Mid-level",
    "job_titles": ["Software Developer", "Frontend Engineer"],
    "companies": ["Tech Corp", "StartupXYZ"]
  },
  "education": {
    "highest_degree": "Bachelor's",
    "field_of_study": "Computer Science",
    "school": "Penn State University",
    "graduation_year": 2022
  },
  "contact": {
    "location": "State College, PA",
    "has_linkedin": true,
    "has_github": true,
    "has_portfolio": false
  },
  "summary": "Brief 2-3 sentence professional summary"
}

Important extraction rules:
- Skills: Include all technical skills, programming languages, frameworks, tools
- Experience: Calculate total years based on work history
- Current level: Entry/Junior (0-2 years), Mid-level (3-5 years), Senior (6+ years)
- Location: Extract city, state if mentioned
- Be accurate - if information isn't clearly stated, use null values

Return only the JSON object, no additional text.
`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent extraction
        maxOutputTokens: 800
      }
    });

    const response = result.response.text();
    const processingTime = Date.now() - startTime;
    
    // Parse JSON response
    const parsedData = JSON.parse(response);
    
    // Calculate token usage and cost
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(response);
    const cost = calculateCost(inputTokens, outputTokens);
    
    return {
      parsed_data: parsedData,
      metadata: {
        processing_time_ms: processingTime,
        tokens_used: inputTokens + outputTokens,
        cost_usd: cost,
        model_used: 'gemini-1.5-flash'
      }
    };
  } catch (error) {
    console.error('Resume parsing error:', error);
    // Fallback to basic regex parsing if AI fails
    return {
      parsed_data: fallbackResumeParser(resumeText),
      metadata: {
        processing_time_ms: Date.now() - startTime,
        tokens_used: 0,
        cost_usd: 0,
        model_used: 'fallback_regex',
        error: error.message
      }
    };
  }
};

/**
 * Fallback regex-based parsing if AI fails
 * @param {string} resumeText - Raw resume text
 * @returns {Object} Basic structured data
 */
const fallbackResumeParser = (resumeText) => {
  const skills = extractSkillsRegex(resumeText);
  const experience = extractExperienceRegex(resumeText);
  const education = extractEducationRegex(resumeText);
  const contact = extractContactRegex(resumeText);
  
  return {
    skills: {
      technical: skills.technical,
      soft: skills.soft,
      tools: skills.tools
    },
    experience: {
      total_years: experience.years,
      current_level: experience.level,
      job_titles: experience.titles,
      companies: experience.companies
    },
    education: {
      highest_degree: education.degree,
      field_of_study: education.field,
      school: education.school,
      graduation_year: education.year
    },
    contact: {
      location: contact.location,
      has_linkedin: contact.linkedin,
      has_github: contact.github,
      has_portfolio: contact.portfolio
    },
    summary: extractSummaryRegex(resumeText)
  };
};

/**
 * Extract technical skills using regex patterns
 */
const extractSkillsRegex = (text) => {
  const commonTechSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'Git', 'AWS', 'Docker', 'TypeScript', 'Vue', 'Angular', 'PHP', 'C++', 'C#',
    'MongoDB', 'PostgreSQL', 'Redis', 'Kubernetes', 'Jenkins', 'Linux'
  ];
  
  const commonSoftSkills = [
    'Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Project Management',
    'Critical Thinking', 'Time Management', 'Adaptability', 'Creativity'
  ];
  
  const commonTools = [
    'Figma', 'Photoshop', 'Jira', 'Slack', 'Trello', 'Notion', 'Excel',
    'PowerPoint', 'Tableau', 'Salesforce'
  ];
  
  const technical = commonTechSkills.filter(skill => 
    new RegExp(skill, 'i').test(text)
  );
  
  const soft = commonSoftSkills.filter(skill => 
    new RegExp(skill, 'i').test(text)
  );
  
  const tools = commonTools.filter(tool => 
    new RegExp(tool, 'i').test(text)
  );
  
  return { technical, soft, tools };
};

/**
 * Extract experience information using regex
 */
const extractExperienceRegex = (text) => {
  // Look for year patterns (2020-2023, 2020-Present, etc.)
  const yearRanges = text.match(/\b(20\d{2})\s*[-–]\s*(20\d{2}|Present|Current)\b/gi) || [];
  
  let totalYears = 0;
  yearRanges.forEach(range => {
    const [start, end] = range.split(/[-–]/);
    const startYear = parseInt(start.trim());
    const endYear = end.trim().toLowerCase().includes('present') || end.trim().toLowerCase().includes('current') 
      ? new Date().getFullYear() 
      : parseInt(end.trim());
    
    if (startYear && endYear) {
      totalYears += (endYear - startYear);
    }
  });
  
  // Determine level based on experience
  let level = 'Entry-level';
  if (totalYears >= 6) level = 'Senior';
  else if (totalYears >= 3) level = 'Mid-level';
  else if (totalYears >= 1) level = 'Junior';
  
  // Extract job titles (common patterns)
  const titlePatterns = [
    /\b(Software|Web|Frontend|Backend|Full[- ]?Stack|Data|DevOps|Mobile)\s+(Developer|Engineer|Analyst|Scientist)\b/gi,
    /\b(Product|Project|Program)\s+Manager\b/gi,
    /\b(UI|UX|Product)\s+Designer\b/gi,
    /\bIntern\b/gi
  ];
  
  const titles = [];
  titlePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    titles.push(...matches);
  });
  
  // Extract company names (harder without more context, basic attempt)
  const companies = [];
  const companyIndicators = text.match(/\b[A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Corporation|Company|Technologies|Tech|Solutions)\b/g) || [];
  companies.push(...companyIndicators.slice(0, 5)); // Limit to first 5 matches
  
  return {
    years: Math.max(totalYears, 0),
    level,
    titles: [...new Set(titles)], // Remove duplicates
    companies: [...new Set(companies)]
  };
};

/**
 * Extract education information
 */
const extractEducationRegex = (text) => {
  const degreePatterns = {
    "PhD": /\b(PhD|Ph\.D\.|Doctor of Philosophy|Doctorate)\b/i,
    "Master's": /\b(Master|M\.S\.|M\.A\.|MBA|M\.Eng\.|MS|MA)\b/i,
    "Bachelor's": /\b(Bachelor|B\.S\.|B\.A\.|BS|BA)\b/i,
    "Associate": /\b(Associate|A\.S\.|A\.A\.|AS|AA)\b/i
  };
  
  let highestDegree = null;
  for (const [degree, pattern] of Object.entries(degreePatterns)) {
    if (pattern.test(text)) {
      highestDegree = degree;
      break; // Stop at highest degree found
    }
  }
  
  // Extract field of study
  const fieldPatterns = [
    /\bin\s+([A-Z][a-zA-Z\s]+?)(?:\s|,|\.|\n)/g,
    /([A-Z][a-zA-Z\s]*(?:Science|Engineering|Studies|Arts|Business|Management))/g
  ];
  
  let fieldOfStudy = null;
  for (const pattern of fieldPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      fieldOfStudy = matches[0].replace(/^in\s+/, '').trim();
      break;
    }
  }
  
  // Extract graduation year
  const yearMatch = text.match(/\b(19|20)\d{2}\b/g);
  const graduationYear = yearMatch ? Math.max(...yearMatch.map(Number)) : null;
  
  // Extract school name (basic attempt)
  const schoolPatterns = [
    /\b([A-Z][a-zA-Z\s]+(?:University|College|Institute|School))\b/g
  ];
  
  let school = null;
  for (const pattern of schoolPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      school = matches[0];
      break;
    }
  }
  
  return {
    degree: highestDegree,
    field: fieldOfStudy,
    school,
    year: graduationYear
  };
};

/**
 * Extract contact information
 */
const extractContactRegex = (text) => {
  // Location patterns
  const locationPattern = /\b([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\b/;
  const locationMatch = text.match(locationPattern);
  const location = locationMatch ? `${locationMatch[1]}, ${locationMatch[2]}` : null;
  
  // Social profiles
  const hasLinkedin = /linkedin\.com|LinkedIn/i.test(text);
  const hasGithub = /github\.com|GitHub/i.test(text);
  const hasPortfolio = /portfolio|website|\.dev|\.io/i.test(text);
  
  return {
    location,
    linkedin: hasLinkedin,
    github: hasGithub,
    portfolio: hasPortfolio
  };
};

/**
 * Extract professional summary
 */
const extractSummaryRegex = (text) => {
  // Look for summary sections
  const summaryPatterns = [
    /(?:Summary|Profile|Objective|About)[:\n](.*?)(?:\n\s*\n|\n[A-Z])/is,
    /^(.{100,300}?)(?:\n|\.|$)/m // First 100-300 chars as fallback
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 200); // Limit length
    }
  }
  
  return null;
};

module.exports = {
  gradeResume,
  analyzeJobMatch,
  optimizeResume,
  generateCompanyResearch,
  parseResumeData 
};
