// =====================================================
// VALIDATION MIDDLEWARE (middleware/validation.js)
// =====================================================

const Joi = require('joi');

// Validation schemas
const schemas = {
  job: Joi.object({
    title: Joi.string().required().max(200),
    company: Joi.string().required().max(100),
    url: Joi.string().uri().allow('').optional(),  // Allow empty string
    description: Joi.string().allow('').optional(),  // Allow empty string
    location: Joi.string().allow('').max(100).optional(),  // Allow empty string
    salary_min: Joi.number().integer().min(0).optional(),
    salary_max: Joi.number().integer().min(0).optional(),
    job_type: Joi.string().allow('').max(50).optional(),  // Allow empty string
    experience_level: Joi.string().allow('').max(50).optional(),  // Allow empty string
    posted_date: Joi.date().optional(),
    deadline_date: Joi.date().optional(),
    source: Joi.string().valid('indeed', 'linkedin', 'glassdoor', 'company_website', 'nittany_careers', 'manual', 'other').optional(),
    is_remote: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    notes: Joi.string().allow('').optional()  // Allow empty string
  }),

  application: Joi.object({
    job_id: Joi.string().uuid().required(),
    status: Joi.string().valid('saved', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn').optional(),
    applied_date: Joi.date().optional(),
    resume_version: Joi.string().allow('').optional(),  // Allow empty string
    cover_letter: Joi.string().allow('').optional(),  // Allow empty string
    follow_up_date: Joi.date().optional(),
    notes: Joi.string().allow('').optional()  // Allow empty string
  }),

  userProfile: Joi.object({
    first_name: Joi.string().allow('').max(50).optional(),  // Allow empty string
    last_name: Joi.string().allow('').max(50).optional(),  // Allow empty string
    linkedin_url: Joi.string().uri().allow('').optional(),  // Allow empty string
    github_url: Joi.string().uri().allow('').optional(),  // Allow empty string
    portfolio_url: Joi.string().uri().allow('').optional(),  // Allow empty string
    target_locations: Joi.array().items(Joi.string().max(100)).optional(),
    target_roles: Joi.array().items(Joi.string().max(100)).optional(),
    skills: Joi.array().items(Joi.string().max(50)).optional(),
    experience_years: Joi.number().integer().min(0).max(50).optional()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schemas[schema].validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

module.exports = { validate, schemas };

